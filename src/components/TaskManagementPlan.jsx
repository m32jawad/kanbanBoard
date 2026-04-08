import React from "react";

const steps = [
  { title: "Capture", detail: "Collect all incoming work in Ideas with clear task titles and owners." },
  { title: "Prioritize", detail: "Set importance and due date. Keep high-priority work small and actionable." },
  { title: "Execute", detail: "Move tasks into In Progress only when an assignee is set." },
  { title: "Review", detail: "Use List View daily to check overdue and unassigned tasks." },
  { title: "Close", detail: "Move completed tasks to Done and keep notes/screenshots for handoff." },
];

export default function TaskManagementPlan({ board }) {
  const stats = board.columns.reduce(
    (acc, column) => {
      column.cards.forEach((card) => {
        acc.total += 1;
        if (!card.assignee) acc.unassigned += 1;
        if (!card.dueDate) acc.noDueDate += 1;
        if (card.importance === "high") acc.highPriority += 1;
      });
      return acc;
    },
    { total: 0, unassigned: 0, noDueDate: 0, highPriority: 0 }
  );

  return (
    <section className="plan-panel">
      <div className="plan-stats">
        <article>
          <h3>{stats.total}</h3>
          <p>Total Tasks</p>
        </article>
        <article>
          <h3>{stats.unassigned}</h3>
          <p>Unassigned</p>
        </article>
        <article>
          <h3>{stats.noDueDate}</h3>
          <p>No Due Date</p>
        </article>
        <article>
          <h3>{stats.highPriority}</h3>
          <p>High Priority</p>
        </article>
      </div>
      <div className="plan-workflow">
        {steps.map((step) => (
          <article key={step.title}>
            <h4>{step.title}</h4>
            <p>{step.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
