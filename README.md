# AgentOps

**Operator layer for autonomous revenue services.**

AgentOps is a control surface for AI-powered services that need to run like real businesses.  
Instead of stopping at “the agent can do the work,” AgentOps makes the operating layer visible:

- wallet status
- checkout
- fulfillment proof
- revenue, costs, and profit

The goal is simple: turn autonomous services from black-box workflows into systems an operator can actually supervise, trust, and scale.

---

## Why this exists

AI services are getting better at doing work, but the business layer around them is still fragmented.

A model can generate output.  
An agent can execute a task.  
But operators still struggle to answer the questions that matter:

- Did this service get paid?
- What did it spend to fulfill the work?
- What proof exists that the work actually happened?
- Is the service actually profitable?

AgentOps solves that gap by giving operators one product to oversee the full business loop.

> **AI can do the work. AgentOps makes it operable.**

---

## What AgentOps does

AgentOps is designed for autonomous digital services such as:

- landing page audits
- competitor intelligence reports
- ad copy packs
- other repeatable AI-assisted service workflows

From one operator surface, AgentOps can:

1. show the operator wallet and live balance
2. create a real hosted checkout session
3. run fulfillment steps through wrapped APIs
4. attach proof artifacts back to the workflow
5. keep service-level economics visible

This makes an AI service feel less like a demo and more like a business unit.

---

## Core product surfaces

### 1. Fleet dashboard
The dashboard shows a portfolio of autonomous services with:

- agent/service name
- status
- price
- revenue
- orders
- top-level economics

### 2. Locus Control
The Locus Control panel is the live proof surface for the product.

It exposes:

- wallet status
- mode state
- checkout proof
- search proof
- screenshot proof

### 3. Agent detail view
Each agent has its own detail page showing the service context and supporting transaction / proof data.

### 4. Landing page
The landing page positions AgentOps as a category-level product rather than a generic hackathon demo.

---

## Live proof loop

The strongest part of AgentOps is the working proof loop.

### Live wallet proof
AgentOps connects to a Locus wallet on Base and surfaces the wallet state directly in-product.

### Live checkout proof
AgentOps creates a real hosted checkout session and returns a real session ID + checkout URL.

### Live fulfillment proof
AgentOps runs live wrapped provider calls during fulfillment, including:

- **Exa** for search proof
- **Firecrawl** for screenshot proof

### Operational truth
The UI distinguishes between:

- **LIVE**
- **SIMULATED**
- **unavailable / fallback**

This honesty layer is intentional. The product does not pretend a capability exists when it does not.

---

## Why it fits Locus

AgentOps uses PayWithLocus as a core product primitive, not a bolt-on payment button.

It integrates:

- live wallet visibility
- checkout session creation
- wrapped API fulfillment
- operator-side proof surfaces
- mode-aware control between demo and live behavior

That means the service can:

- hold funds
- get paid
- spend on fulfillment
- attach proof to the work
- remain inspectable to the operator

---

## Tech stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Vercel**
- **PayWithLocus / Locus Beta API**
- **Exa**
- **Firecrawl**

---

## Repository structure

```text
app/
  api/
  dashboard/
components/
lib/
public/
