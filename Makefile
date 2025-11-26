# =============================================================================
# Nahyunjong Project Makefile
# =============================================================================
# Single entry point for all operations
# =============================================================================

.PHONY: help check deploy dev build clean

.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Show this help message
	@echo "$(BLUE)Nahyunjong Project Commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Most common command:$(NC)"
	@echo "  $(GREEN)make deploy$(NC)     - Deploy to production"
	@echo ""

check: ## Run prerequisite checks before deployment
	@echo "$(BLUE)Running prerequisite checks...$(NC)"
	@bash -c ' \
		errors=0; \
		if ! docker info > /dev/null 2>&1; then \
			echo "$(YELLOW)[FAIL]$(NC) Docker is not running"; \
			errors=$$((errors+1)); \
		else \
			echo "$(GREEN)[PASS]$(NC) Docker is running"; \
		fi; \
		if [ ! -f ~/.aws/credentials ]; then \
			echo "$(YELLOW)[FAIL]$(NC) AWS credentials not found at ~/.aws/credentials"; \
			errors=$$((errors+1)); \
		else \
			echo "$(GREEN)[PASS]$(NC) AWS credentials found"; \
		fi; \
		if [ ! -f .env ]; then \
			echo "$(YELLOW)[FAIL]$(NC) .env file not found (copy from .env.example)"; \
			errors=$$((errors+1)); \
		else \
			echo "$(GREEN)[PASS]$(NC) .env file exists"; \
		fi; \
		if [ ! -f nahyunjong-key.pem ]; then \
			echo "$(YELLOW)[FAIL]$(NC) EC2 SSH key not found"; \
			errors=$$((errors+1)); \
		else \
			echo "$(GREEN)[PASS]$(NC) EC2 SSH key found"; \
		fi; \
		if [ $$errors -eq 0 ]; then \
			echo ""; \
			echo "$(GREEN)All checks passed! Ready to deploy.$(NC)"; \
			exit 0; \
		else \
			echo ""; \
			echo "$(YELLOW)$$errors check(s) failed. See CHECKLIST.md for help.$(NC)"; \
			exit 1; \
		fi \
	'

deploy: check ## Deploy to production (ONLY way to deploy)
	@echo "$(BLUE)Starting deployment...$(NC)"
	@echo ""
	@bash scripts/deploy.sh

dev: ## Start local development environment
	@echo "$(BLUE)Starting local development environment...$(NC)"
	@docker-compose up -d

build: ## Build Docker images locally (without deploying)
	@echo "$(BLUE)Building Docker images...$(NC)"
	@cd client && docker build -f Dockerfile.prod -t nahyunjong-client:latest .
	@cd server && docker build -f Dockerfile.prod -t nahyunjong-server:latest .
	@echo "$(GREEN)Build complete$(NC)"

clean: ## Stop and remove all containers
	@echo "$(BLUE)Cleaning up containers...$(NC)"
	@docker-compose down -v
	@echo "$(GREEN)Cleanup complete$(NC)"

logs: ## View EC2 production logs
	@echo "$(BLUE)Connecting to EC2 logs...$(NC)"
	@bash -c 'source .env && ssh -i "$$EC2_KEY_PATH" $$EC2_USER@$$EC2_HOST "cd nahyunjong && docker compose -f docker-compose.prod-ecr.yml logs -f"'

status: ## Check EC2 service status
	@echo "$(BLUE)Checking EC2 service status...$(NC)"
	@bash -c 'source .env && ssh -i "$$EC2_KEY_PATH" $$EC2_USER@$$EC2_HOST "cd nahyunjong && docker compose -f docker-compose.prod-ecr.yml ps"'
