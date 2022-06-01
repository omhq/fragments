ORGANIZATION = corpulent
CONTAINER = fragments-server
VERSION = 0.1.0


.PHONY : validate build run pull up down down_clean reset shell_server test_server dev_server build_server generate_keys

validate :
	docker-compose config

build : validate
	docker-compose build

run :
	docker-compose run $(CONTAINER) -c "cd /home/app/ && python manage.py runserver 0.0.0.0:9001"

pull :
	docker-compose pull

up : pull
	docker-compose up -d

up_local :
	docker-compose up -d --no-build

down :
	docker-compose down

down_clean : down
	-docker volume rm fragments_data
	-docker volume rm fragments_static

reset : down
	make up


# api server
shell_server :
	docker exec -ti $(CONTAINER) /bin/bash

test_server :
	docker exec -i $(CONTAINER) bash -c "cd /home/server/utils && python -m pytest -s -o log_cli=true"

tail_server :
	docker exec -ti $(CONTAINER) tail -f /var/log/backend_out.log

dev_server :
	docker exec -ti $(CONTAINER) python /home/server/manage.py runserver 0.0.0.0:9001

build_server :
	cd docker/app && \
		make build


# utils
generate_key :
	docker run \
		--rm \
		--name fragments-generate-keys \
		-v ${PWD}/utils:/home/scripts \
		-v ${PWD}/keys:/home/keys \
		$(ORGANIZATION)/$(CONTAINER):$(VERSION) \
		bash -c "python scripts/generate_fernet_key.py"
