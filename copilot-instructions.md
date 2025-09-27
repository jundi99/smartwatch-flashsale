You are Senior Full Stack Developer, i want you to make apps using NodeJs and ReactJS. So first main Focus to the structur of the folder project.
Make me best structure folder project for Full stack developer, i want this project have a eslint for format code and consistency for style coding
using commonjs, and have validation using Joi in backend, have unit test, integration test and stress test using k6. For Frontend make me simple
UI for flash sale system apps with feature:
- Login using username and password
- have page that contain list item include image of item, quantity and information of item (available/ sold)
- Pop up notification if item already success to buy / error if already sold

So this is detail Core Functional Requirements:
1. Flash Sale Period: The flash sale must have a configurable start and end time. The system should only allow purchase attempts within this window.
2. Single Product, Limited Stock: To simplify the problem, we will only be selling one type of product. This product has a predefined, limited quantity available for purchase.
3. One Item Per User: Each user is permitted to purchase only one unit of the product during the sale. The system must enforce this rule.
4. API Server: You need to implement a server that exposes the necessary API endpoints to support the flash sale functionality. This should include, but is not limited to:
    - An endpoint to check the status of the flash sale (e.g., upcoming, active, ended).
    - An endpoint for a user to attempt a purchase.
    - An endpoint for a user to check if they have successfully secured an item.
5. Simple Frontend: Develop a basic frontend interface to demonstrate the functionality of your system. The frontend should allow a user to:
    - See the current status of the sale.
    - Enter a user identifier (e.g., a username or email).
    - Click a "Buy Now" button to attempt a purchase.
    - Receive feedback on whether their purchase was successful, if they have already purchased, or if the sale has ended/sold out.
6. System Diagram: Create a clear and concise system architecture diagram. This should illustrate the main components of your system and how they interact with each other. Be prepared to justify your design choices.

Non-Functional Requirements:

1. High Throughput & Scalability: The system must be designed to handle a large number of concurrent requests. Your design should be scalable to accommodate even larger traffic loads. Think about potential bottlenecks and how to mitigate them.
2. Robustness & Fault Tolerance: The system should be resilient to failures. Consider what might go wrong under heavy load (e.g., service crashes, network issues) and how your system would handle such scenarios.
3. Concurrency Control: A critical aspect of this project is managing concurrent requests to purchase a limited number of items. Your solution must prevent overselling and handle race conditions effectively.

Testing Requirements:

- Unit & Integration Tests: Include unit and integration tests for your service's business logic and API endpoints.
- Stress Tests: Implement stress tests to simulate a high volume of concurrent users attempting to purchase the item. The goal is to demonstrate that your system can handle the load without failing and that your concurrency controls are effective. You should be able to explain the results of your stress tests.

Technical Guidelines:
- Language & Framework:
    - Language: JavaScriptis required.
    - Backend: Your API server must be built using Node.js Framework Express.
    - Frontend: The user interface must be built using React.
- Cloud Services: You are encouraged to design your system with modern cloud services in mind (e.g., message queues, distributed caches, databases). However, for the purpose of this project, you do not need to deploy to a live cloud environment. You can mock out these more advanced services. For example, instead of using a managed Redis or RabbitMQ service, you can run them locally in Docker containers or even simulate their behavior in-memory for some components, as long as you explain your architectural choices.

Deliverables: Please provide the following:
1. A link to your source code in a Git repository (e.g., GitHub, GitLab).
2. A README.md file in your repository that includes:
    - A brief explanation of your design choices and trade-offs.
    - The system diagram you have created.
    - Clear instructions on how to build and run the project (server, frontend, and tests).
    - Instructions on how to run the stress tests and a summary of the expected outcome.