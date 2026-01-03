package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"sort"
	"strings"

	"github.com/coreos/go-semver/semver"
)

func runCommand(command string) string {
	parts := strings.Fields(command)
	cmd := exec.Command(parts[0], parts[1:]...)
	output, err := cmd.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(output))
}

func getLatestTag(prefix string) (string, string) {
	cmd := exec.Command("git", "tag", "--list", prefix+"*")
	output, err := cmd.Output()
	if err != nil {
		return "0.0.0", ""
	}

	tags := strings.Split(strings.TrimSpace(string(output)), "\n")
	var versions []*semver.Version
	tagMap := make(map[string]string)

	for _, tag := range tags {
		if tag == "" {
			continue
		}
		vStr := strings.TrimPrefix(tag, prefix)
		v, err := semver.NewVersion(vStr)
		if err == nil {
			versions = append(versions, v)
			tagMap[v.String()] = tag
		}
	}

	if len(versions) == 0 {
		return "0.0.0", ""
	}

	sort.Sort(semver.Versions(versions))
	latestVersion := versions[len(versions)-1]

	// Get the commit hash for the latest tag
	latestTag := tagMap[latestVersion.String()]
	commitHash := runCommand("git rev-list -n 1 " + latestTag)

	return latestVersion.String(), commitHash
}

func getBumpType(path string, lastCommit string) string {
	var logCmd string
	if lastCommit == "" {
		// No previous tag, check all history
		logCmd = fmt.Sprintf("git log --format=%%B -- %s", path)
	} else {
		// Check history since last tag
		logCmd = fmt.Sprintf("git log %s..HEAD --format=%%B -- %s", lastCommit, path)
	}

	commitMessages := runCommand(logCmd)

	if commitMessages == "" {
		return ""
	}

	if strings.Contains(commitMessages, "BREAKING CHANGE:") {
		return "major"
	}

	featRegex := regexp.MustCompile(`(?m)^feat(\(.*\))?:`)
	if featRegex.MatchString(commitMessages) {
		return "minor"
	}

	fixRegex := regexp.MustCompile(`(?m)^fix(\(.*\))?:`)
	if fixRegex.MatchString(commitMessages) {
		return "patch"
	}

	return ""
}

func incrementVersion(version, bumpType string) string {
	v, err := semver.NewVersion(version)
	if err != nil {
		// Fallback for non-semver compliant initial versions if any, though we default to 0.0.0
		return version
	}

	switch bumpType {
	case "major":
		v.BumpMajor()
	case "minor":
		v.BumpMinor()
	case "patch":
		v.BumpPatch()
	}

	return v.String()
}

func main() {
	pathPtr := flag.String("path", "", "Path to check for changes")
	tagPrefixPtr := flag.String("tag-prefix", "", "Prefix for git tags (e.g., backend/v)")

	// Kept for backward compatibility or file-based usage if needed, but primary is now tag-based
	filePtr := flag.String("file", "", "Version file to update (optional)")
	typePtr := flag.String("type", "", "Type of version file (text or json) (optional)")

	dryRunPtr := flag.Bool("dry-run", false, "Calculate version but do not write to file")
	prereleaseSuffixPtr := flag.String("prerelease-suffix", "", "Suffix to append to the new version (e.g., -beta.1)")

	flag.Parse()

	if *pathPtr == "" || *tagPrefixPtr == "" {
		fmt.Println("Usage: go run bump_version.go --path <path> --tag-prefix <prefix> [--file <file>] [--type <text|json>] [--dry-run] [--prerelease-suffix <suffix>]")
		os.Exit(1)
	}

	currentVersion, lastCommit := getLatestTag(*tagPrefixPtr)
	fmt.Printf("Latest version for %s: %s (Commit: %s)\n", *tagPrefixPtr, currentVersion, lastCommit)

	bumpType := getBumpType(*pathPtr, lastCommit)
	if bumpType == "" {
		fmt.Println("No changes requiring version bump.")
		return
	}

	fmt.Printf("Detected %s change.\n", bumpType)

	newVersion := incrementVersion(currentVersion, bumpType)
	if *prereleaseSuffixPtr != "" {
		newVersion = newVersion + *prereleaseSuffixPtr
	}
	fmt.Printf("Bumping version: %s -> %s\n", currentVersion, newVersion)

	// If file arguments are provided, update the file as well (optional hybrid approach)
	if *filePtr != "" && *typePtr != "" && !*dryRunPtr {
		if *typePtr == "text" {
			if err := os.WriteFile(*filePtr, []byte(newVersion), 0644); err != nil {
				panic(err)
			}
		} else if *typePtr == "json" {
			content, err := os.ReadFile(*filePtr)
			if err == nil {
				var jsonData map[string]interface{}
				if err := json.Unmarshal(content, &jsonData); err == nil {
					jsonData["version"] = newVersion
					content, _ := json.MarshalIndent(jsonData, "", "  ")
					content = append(content, '\n')
					_ = os.WriteFile(*filePtr, content, 0644)
				}
			}
		}
	}

	// Output for GitHub Actions
	if githubOutput := os.Getenv("GITHUB_OUTPUT"); githubOutput != "" {
		f, err := os.OpenFile(githubOutput, os.O_APPEND|os.O_WRONLY, 0644)
		if err != nil {
			panic(err)
		}
		defer f.Close()
		if _, err := f.WriteString(fmt.Sprintf("new_version=%s\n", newVersion)); err != nil {
			panic(err)
		}
		if _, err := f.WriteString(fmt.Sprintf("new_tag=%s%s\n", *tagPrefixPtr, newVersion)); err != nil {
			panic(err)
		}
		if _, err := f.WriteString("bumped=true\n"); err != nil {
			panic(err)
		}
	}
}
