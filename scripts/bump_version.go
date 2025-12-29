package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
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

func getBumpType(path, versionFile string) string {
	// Find the last commit that modified the version file
	lastCommitCmd := fmt.Sprintf("git log -n 1 --format=%%H -- %s", versionFile)
	lastCommit := runCommand(lastCommitCmd)

	if lastCommit == "" {
		fmt.Printf("No previous commit found for %s. Assuming initial version.\n", versionFile)
		return ""
	}

	// Get all commit messages since that commit affecting the path
	logCmd := fmt.Sprintf("git log %s..HEAD --format=%%B -- %s", lastCommit, path)
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
	parts := strings.Split(version, ".")
	if len(parts) != 3 {
		return version // Return original if not semantic
	}

	major, _ := strconv.Atoi(parts[0])
	minor, _ := strconv.Atoi(parts[1])
	patch, _ := strconv.Atoi(parts[2])

	switch bumpType {
	case "major":
		major++
		minor = 0
		patch = 0
	case "minor":
		minor++
		patch = 0
	case "patch":
		patch++
	}

	return fmt.Sprintf("%d.%d.%d", major, minor, patch)
}

func main() {
	pathPtr := flag.String("path", "", "Path to check for changes")
	filePtr := flag.String("file", "", "Version file to update")
	typePtr := flag.String("type", "", "Type of version file (text or json)")

	flag.Parse()

	if *pathPtr == "" || *filePtr == "" || *typePtr == "" {
		fmt.Println("Usage: go run bump_version.go --path <path> --file <file> --type <text|json>")
		os.Exit(1)
	}

	if _, err := os.Stat(*filePtr); os.IsNotExist(err) {
		fmt.Printf("Error: File %s not found\n", *filePtr)
		os.Exit(1)
	}

	bumpType := getBumpType(*pathPtr, *filePtr)
	if bumpType == "" {
		fmt.Println("No changes requiring version bump.")
		return
	}

	fmt.Printf("Detected %s change.\n", bumpType)

	var currentVersion string
	var jsonData map[string]interface{}

	if *typePtr == "text" {
		content, err := os.ReadFile(*filePtr)
		if err != nil {
			panic(err)
		}
		currentVersion = strings.TrimSpace(string(content))
	} else if *typePtr == "json" {
		content, err := os.ReadFile(*filePtr)
		if err != nil {
			panic(err)
		}
		if err := json.Unmarshal(content, &jsonData); err != nil {
			panic(err)
		}
		if v, ok := jsonData["version"].(string); ok {
			currentVersion = v
		} else {
			currentVersion = "0.0.0"
		}
	}

	newVersion := incrementVersion(currentVersion, bumpType)
	fmt.Printf("Bumping version: %s -> %s\n", currentVersion, newVersion)

	if *typePtr == "text" {
		if err := os.WriteFile(*filePtr, []byte(newVersion), 0644); err != nil {
			panic(err)
		}
	} else if *typePtr == "json" {
		jsonData["version"] = newVersion
		content, err := json.MarshalIndent(jsonData, "", "  ")
		if err != nil {
			panic(err)
		}
		// Add newline at end of file
		content = append(content, '\n')
		if err := os.WriteFile(*filePtr, content, 0644); err != nil {
			panic(err)
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
		if _, err := f.WriteString("bumped=true\n"); err != nil {
			panic(err)
		}
	}
}
