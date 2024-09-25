.DEFAULT_GOAL := d-shell

# ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░

d-compose:
	docker compose up -d node

d-shell: setup d-compose bash

setup:
	@[ -f "./.env" ] || cp .env.example .env

restart:
	@docker compose down node
	@make d-compose



#   █▄░█  █▀█  █▀▄  █▀▀
#   █░▀█  █▄█  █▄▀  ██▄

node-assets:
	npm install
	npm run start

# Fix audits
fix:
	npm audit fix



#   █▀  █░█  █▀▀  █░░  █░░
#   ▄█  █▀█  ██▄  █▄▄  █▄▄
#   𝕆𝕡𝕖𝕟 𝕒 𝕓𝕒𝕤𝕙 𝕤𝕙𝕖𝕝𝕝 𝕠𝕟 𝕥𝕙𝕖 𝕣𝕦𝕟𝕟𝕚𝕟𝕘 𝕔𝕠𝕟𝕥𝕒𝕚𝕟𝕖𝕣
bash:
	docker compose exec node ash

# Remove ignored git files – e.g. dependencies and built assets
# But keep .env file, .idea directory (PhpStorm config), and generated assets
clean:
	@if [ -d ".git" ]; then git clean -xdf --exclude ".env" --exclude ".idea"; fi
	@clear

# Remove all ignored git files (including media files)
deep-clean:
	@if [ -d ".git" ]; then git clean -xdf --exclude ".idea"; fi



#   ▄▀█  █▀▀  ▀█▀  █  █▀█  █▄░█
#   █▀█  █▄▄  ░█░  █  █▄█  █░▀█
#   ℝ𝕦𝕟 𝕥𝕙𝕖 𝕒𝕡𝕡𝕝𝕚𝕔𝕒𝕥𝕚𝕠𝕟
run: up

up:
	docker compose up

down:
	docker compose down



#   █▄▀  █░█  █▄▄  █▀▀  █▀█  █▄░█  █▀▀  ▀█▀  █▀▀  █▀
#   █░█  █▄█  █▄█  ██▄  █▀▄  █░▀█  ██▄  ░█░  ██▄  ▄█

port-forward:
	@$(k8s_pod) | echo $$(cat -)" "$(k8s_prt) | xargs kubectl -n $(k8s_nsp) port-forward

unapply:
	@$(k8s_pod) | xargs kubectl -n $(k8s_nsp) delete pod

apply:
	kubectl apply -f deploy/production

