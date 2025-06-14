# Social Media App Microservices API

A scalable and secure backend API inspired by social media platforms, implemented using microservices architecture, Docker, and Kubernetes.

## 🚀 Overview

This project demonstrates the creation of a robust and scalable microservices architecture designed to efficiently handle social media functionalities such as user management, post creation, media handling, and search features. Services communicate via an API Gateway, leveraging Redis for caching and RabbitMQ for message handling.

## 🛠 Technologies Used

* **Docker**: Containerization of each service for efficient deployment.
* **Kubernetes**: Container orchestration and service management.
* **Horizontal Pod Autoscaler (HPA)**: Automated scaling based on real-time demand.
* **Redis**: Fast, scalable caching mechanism.
* **RabbitMQ**: Asynchronous messaging broker for inter-service communication.

## 📦 Microservices

* **User Service**: Handles user authentication, authorization, and profile management.
* **Post Service**: Manages user-generated posts and content.
* **Media Service**: Responsible for media storage and retrieval.
* **Search Service**: Implements search functionality across the platform.
* **API Gateway**: Centralized entry point managing requests and responses between services.

## 🚧 Setup and Deployment

### Prerequisites

* Docker
* Kubernetes (e.g., Minikube or a managed Kubernetes cluster)
* kubectl

### Deployment Steps

1. Clone the repository:

```bash
git clone https://github.com/LionelGokul/Social-Media-App-Microservices-API.git
cd Social-Media-App-Microservices-API
```

2. Build Docker images and deploy services to Kubernetes:

```bash
kubectl apply -f k8s/
```

3. Verify deployment status:

```bash
kubectl get pods
```

## 📈 Scaling

Services scale automatically using Kubernetes' HPA based on CPU usage or other defined metrics:

```bash
kubectl get hpa
```

## 📌 Future Improvements

* Implement CI/CD pipelines
* Add monitoring and logging with Prometheus and Grafana
* Enhance security with a service mesh like Istio

## 📝 License

This project is available for you to fork, modify, and play with, but please provide proper attribution by referencing me (LionelGokul) and linking back to this repository.

© 2025 LionelGokul
