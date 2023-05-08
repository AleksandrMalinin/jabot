build:
	docker build -t jabot .

run:
	docker run -d -p 3000:3000 --name jabot --rm jabot
