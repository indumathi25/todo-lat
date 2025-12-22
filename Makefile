.PHONY: up down build migrate shell

up:
	docker-compose up

down:
	docker-compose down

build:
	docker-compose build

migrate:
	docker-compose run --rm backend python manage.py migrate

makemigrations:
	docker-compose run --rm backend python manage.py makemigrations

shell:
	docker-compose run --rm backend python manage.py shell

test:
	docker-compose run --rm backend python manage.py test
	cd frontend && npm run test

deploy:
	./scripts/deploy.sh $(v)

rollback_release:
	./scripts/rollback_release.sh $(v) $(a) $(m)
