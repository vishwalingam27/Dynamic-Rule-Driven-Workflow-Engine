import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import ExecutionView from './pages/ExecutionView';
import ExecutionHistory from './pages/ExecutionHistory';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<WorkflowList />} />
            <Route path="/workflows/new" element={<WorkflowEditor />} />
            <Route path="/workflows/:id" element={<WorkflowEditor />} />
            <Route path="/execute/:id" element={<ExecutionView />} />
            <Route path="/execute/:id/:executionId" element={<ExecutionView />} />
            <Route path="/history" element={<ExecutionHistory />} />
            <Route path="/executions/:executionId" element={<ExecutionView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
