# 🚀 Dynamic Rule-Driven Workflow Engine

 DEMO VIDEO LINK:


 
A full-stack web application that allows users to design, execute, and monitor workflows using dynamic rule-based logic.

---

## 📌 Overview

The **Dynamic Rule-Driven Workflow Engine** is a system that enables users to automate business processes by defining workflows, steps, and rules.
Instead of hardcoding logic, workflows are dynamically controlled using conditions evaluated at runtime.

---

## 🎯 Features

### 🔹 Workflow Management

* Create, update, and delete workflows
* Define workflow input schema (JSON)
* Version control support

### 🔹 Step Management

* Add multiple steps to a workflow
* Supported step types:

  * Task
  * Approval
  * Notification

### 🔹 Rule Engine

* Define conditions using expressions:

  * amount > 100
  * priority == "High"
* Supports:

  * Comparison operators (`==`, `!=`, `>`, `<`, `>=`, `<=`)
  * Logical operators (`&&`, `||`)
* Rule priority-based execution
* DEFAULT fallback rule support

### 🔹 Workflow Execution

* Execute workflows with dynamic input data
* Automatic step-by-step navigation based on rules
* Real-time execution status tracking

### 🔹 Execution Logs

* Track each step execution
* View evaluated rules and results
* Debug workflow behavior easily

### 🔹 Dashboard (Control Center)

* Monitor Active Flows (running workflows)
* View Total Logic Steps
* Manage deployed workflows

---

## 🧠 How It Works

1. User creates a workflow
2. Adds steps (Task / Approval / Notification)
3. Defines rules for each step
4. Runs the workflow with input JSON
5. System evaluates rules dynamically
6. Moves to the next step until completion

## 📊 Example

### Input

json
{
  "amount": 200,
  "country": "US",
  "priority": "High"
}

### Execution Flow


Manager Approval
→ amount > 100 → true
→ Finance Review
→ priority == "High" → true
→ CEO Approval
→ End Workflow


## 🏗️ Tech Stack

### Backend

* Java
* Spring Boot
* Spring Data JPA
* MySQL / PostgreSQL

### Frontend

* React
* Tailwind CSS
* Axios

---

## 📂 Project Structure


backend/
frontend/
database/
docs/




## ▶️ Getting Started

### 1. Clone the Repository


git clone [https://github.com/vishwalingam27/Dythub.com/vishwalingam27/Dynamic-Rule-Driven-Workflow-Engine.git]
cd Dynamic-Rule-Driven-Workflow-Engine



### 2. Run Backend

cd backend
mvn spring-boot:run




### 3. Run Frontend

cd frontend
npm install
npm start

### 4. Open Application


http://localhost:5173


## 🧪 Usage

1. Create a workflow
2. Add steps
3. Define rules
4. Deploy workflow
5. Run with input JSON
6. View execution logs

---

## 🔥 Use Cases

* Expense Approval Systems
* Loan Approval Workflows
* Leave Management Systems
* Order Processing Systems



## 🚀 Future Enhancements

* Drag-and-drop workflow builder
* Real-time monitoring (WebSocket)
* Parallel workflow execution
* Retry & error handling
* Visual workflow diagrams



📖 License

This project is for educational and demonstration purposes.



🙌 Author

Developed as a full-stack project demonstrating workflow automation and rule engine design.
