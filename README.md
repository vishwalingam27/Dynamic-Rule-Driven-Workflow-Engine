🚀 Dynamic Rule-Driven Workflow Engine

DEMO VIDEO LINK :
https://drive.google.com/file/d/12rYCO5XDKfIoo0DfWZAaw6qJciCzXHiU/view?usp=sharing

A full-stack application that allows users to create, manage, and execute workflows dynamically using rule-based logic.
Instead of hardcoding business processes, workflows are controlled by configurable rules evaluated at runtime.


📌 Overview

This project is a **Workflow Automation Engine** where users can:

* Define workflows with multiple steps
* Add conditions (rules) to control execution flow
* Execute workflows using input data
* Track execution status and logs in real time


 🎯 Key Features
 🔹 Workflow Management

* Create, edit, delete workflows
* Version control support
* Define input schema using JSON
 🔹 Step Types

* **TASK** → Automated system action
* **APPROVAL** → Requires user decision (Approve / Reject)
* **NOTIFICATION** → Sends alerts or messages

🔹 Rule Engine

* Dynamic condition evaluation:

  * `amount > 100`
  * `priority == "High"`
* Supports:

  * Comparison operators (`==`, `!=`, `>`, `<`, `>=`, `<=`)
  * Logical operators (`&&`, `||`)
* Priority-based rule execution
* DEFAULT fallback rule

 🔹 Workflow Execution

* Start workflow with input JSON
* Executes step-by-step dynamically
* Automatically transitions based on rules

---
 🔹 Approval System

* Pauses execution for approval steps
* Provides:

  * ✅ Approve
  * ❌ Reject + Reason
* Resumes workflow after decision

 🔹 Dashboard (Control Center)

* Active Flows (running workflows)
* Total Engines (workflows created)
* Total Logic Steps
* Deployment & monitoring


🔹 Execution Logs

* Track each step
* View evaluated rules
* Debug workflow flow


 🧠 How It Works

1. Create a workflow
2. Add steps (Task / Approval / Notification)
3. Define rules for each step
4. Run workflow with input JSON
5. System evaluates rules and moves to next step
6. Continues until workflow completes


 📊 Example Workflow (Leave Approval)

 Input

json
{
  "leaveDays": 3,
  "employeeType": FullTime
}


 Flow


Apply Leave
→ Manager Approval
→ Approved
→ HR Notification
→ End Workflow


 🏗️ Tech Stack
 Backend

* Java
* Spring Boot
* Spring Data JPA
* MySQL

 Frontend
* React
* Tailwind CSS
* Axios

 📂 Project Structure

backend/
frontend/
database/

 ▶️ Getting Started

 1️⃣ Clone Repository

git clone https://github.com/vishwalingam27/Dynamic-Rule-Driven-Workflow-Engine.git
cd Dynamic-Rule-Driven-Workflow-Engine


 2️⃣ Run Backend


cd backend
mvn spring-boot:run


 3️⃣ Run Frontend

cd frontend
npm install
npm run dev


 4️⃣ Open App

http://localhost:5173


 🧪 Usage

1. Create a new workflow
2. Add steps and rules
3. Deploy workflow
4. Run with input JSON
5. Approve/Reject (if required)
6. View logs and status

 🔥 Use Cases

* Expense Approval System
* Loan Approval Workflow
* Leave Management System
* Insurance Claim Processing
* Order Processing System

🚀 Future Enhancements

* Drag-and-drop workflow builder
* Real-time updates (WebSocket)
* Parallel workflow execution
* Retry & failure handling
* Email/Slack notifications

📖 License

This project is for learning and demonstration purposes.

🙌 Author
Developed as a full-stack project demonstrating dynamic workflow automation and rule engine design.

🙌 Author
Developed as a full-stack project demonstrating workflow automation and rule engine design.
