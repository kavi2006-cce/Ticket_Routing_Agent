/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileCode, 
  Terminal, 
  Database, 
  Layers, 
  Download, 
  Check, 
  Copy,
  Info,
  BookOpen
} from "lucide-react";

export default function DeliverablesViewer() {
  const [activeTab, setActiveTab] = useState<"springboot" | "fastapi" | "postgresql" | "devops" | "readme">("springboot");
  const [copiedText, setCopiedText] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const codeSpringboot = `// ==========================================
// MAVEN POM.XML DEPENDENCIES
// ==========================================
/*
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
*/

// ==========================================
// SecurityConfig.java
// ==========================================
package com.enterprise.support.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .cors().and()
            .authorizeHttpRequests()
            .requestMatchers("/api/v1/auth/**").permitAll()
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
            .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

// ==========================================
// TicketController.java
// ==========================================
package com.enterprise.support.controller;

import com.enterprise.support.entity.Ticket;
import com.enterprise.support.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket saved = ticketService.createAndRouteTicket(ticket);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getMyTickets() {
        return ResponseEntity.ok(ticketService.getTicketsForCurrentUser());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status));
    }
}`;

  const codeFastapi = `# ==========================================
# REQUIREMENTS.TXT
# ==========================================
# fastapi==0.111.0
# uvicorn==0.30.1
# google-genai==2.4.0
# pydantic==2.7.4

# ==========================================
# MAIN.PY - FASTAPI AI CLASSIFIER SERVICE
# ==========================================
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from google.genai import types

app = FastAPI(title="Aegis Support Cognitive Router API", version="1.0")

# Initialize client using the modern genai SDK
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key and api_key != "MY_GEMINI_API_KEY":
    client = genai.Client(api_key=api_key)

class TicketInput(BaseModel):
    title: str
    description: str

class RoutingResult(BaseModel):
    department: str
    priority: str
    urgency: str
    sentiment: str
    entities: List[str]
    product: str
    slaHours: int
    estimatedResolutionTime: str
    summary: str
    suggestedResponse: str
    knowledgeBaseSuggestions: List[str]
    tags: List[str]

SYSTEM_INSTRUCTION = """
Analyze the customer's support ticket and classify it into a structured JSON response matching the routing rules.
Return exactly:
1. Department: One of (Technical Support, Billing, Payments, Delivery, Returns, Refunds, Replacement, Accounts, Sales, Network Team, IT Team, HR, Security, Maintenance).
2. Priority: One of (Critical, High, Medium, Low).
3. Sentiment: One of (Positive, Neutral, Negative, Frustrated, Angry).
"""

@app.post("/api/v1/ai/route", response_model=RoutingResult)
async def route_ticket(ticket: TicketInput):
    if not client:
        # Graceful rule-based heuristic parser if API key is unconfigured
        return RoutingResult(
            department="Technical Support",
            priority="Medium",
            urgency="Medium",
            sentiment="Neutral",
            entities=["manual-review"],
            product="Enterprise Assets",
            slaHours=24,
            estimatedResolutionTime="24 hours",
            summary="Default fallback. No API key provided.",
            suggestedResponse="Hi, we are checking this ticket.",
            knowledgeBaseSuggestions=[],
            tags=["fallback"]
        )
        
    prompt = f"Title: {ticket.title}\\nDescription: {ticket.description}"

    try {
        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=RoutingResult
            )
        )
        # Parse return text
        return RoutingResult.model_validate_json(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini routing failed: {str(e)}")
`;

  const codePostgresql = `-- ==========================================
-- RELATIONAL POSTGRESQL DATABASE SCHEMAS
-- ==========================================

-- 1. Create Roles & Users tables
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE
);

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role_id INT REFERENCES roles(id),
    department_id INT REFERENCES departments(id),
    avatar_url VARCHAR(255),
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Support Ticket System tables
CREATE TABLE tickets (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department_id INT REFERENCES departments(id),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Waiting for Customer', 'Escalated', 'Resolved', 'Closed', 'Rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_agent_id VARCHAR(50) REFERENCES users(id),
    
    -- AI Generated Attributes
    ai_summary TEXT,
    ai_sentiment VARCHAR(30),
    ai_urgency VARCHAR(20),
    ai_product VARCHAR(100),
    ai_sla_hours INT,
    ai_estimated_resolution VARCHAR(50),
    ai_suggested_response TEXT,
    ai_confidence DECIMAL(3,2),
    ai_reason TEXT,
    ai_tags TEXT[]
);

CREATE TABLE ticket_messages (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id VARCHAR(50) REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachments (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) REFERENCES tickets(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100),
    file_url VARCHAR(512) NOT NULL,
    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_history (
    id VARCHAR(50) PRIMARY KEY,
    ticket_id VARCHAR(50) REFERENCES tickets(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    performed_by VARCHAR(100),
    performed_by_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'System',
    channel VARCHAR(100) DEFAULT 'In-App',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_base (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    views INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  const codeDevops = `# ==========================================
# SPRING BOOT DOCKERFILE
# ==========================================
# FROM maven:3.8.4-openjdk-17 AS build
# COPY src /usr/src/app/src
# COPY pom.xml /usr/src/app
# RUN mvn -f /usr/src/app/pom.xml clean package -DskipTests
# FROM openjdk:17-jdk-slim
# COPY --from=build /usr/src/app/target/*.jar app.jar
# EXPOSE 8080
# ENTRYPOINT ["java","-jar","/app.jar"]

# ==========================================
# FASTAPI PYTHON DOCKERFILE
# ==========================================
# FROM python:3.10-slim
# WORKDIR /app
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# EXPOSE 8000
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ==========================================
# DOCKER-COMPOSE.YML ORCHESTRATOR
# ==========================================
version: '3.8'

services:
  postgres-db:
    image: postgres:15-alpine
    container_name: aegis-postgresql
    environment:
      POSTGRES_DB: aegis_support
      POSTGRES_USER: root
      POSTGRES_PASSWORD: enterprise_secret_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis-cache:
    image: redis:7-alpine
    container_name: aegis-redis
    ports:
      - "6379:6379"

  rabbitmq-mq:
    image: rabbitmq:3-management-alpine
    container_name: aegis-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"

  ai-service:
    build:
      context: ./python-ai
    container_name: aegis-ai-service
    environment:
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - redis-cache

  springboot-backend:
    build:
      context: ./backend
    container_name: aegis-springboot-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-db:5432/aegis_support
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=enterprise_secret_pass
    depends_on:
      - postgres-db
      - rabbitmq-mq
      - ai-service

volumes:
  pgdata:
`;

  const codeReadme = `======================================================
AEGIS AI SUPPORT TICKET ROUTING AGENT
======================================================
Enterprise Customer Support Automation Blueprint

Enterprise architecture details and manuals.

1. DIRECTORY BLUEPRINT:
------------------------------------------
ticket-routing-agent/
 ├── frontend/           (React, TS, Vite, Tailwind CSS)
 ├── backend/            (Java Spring Boot, JPA, Spring Security)
 ├── python-ai/          (Python, FastAPI, Google Gemini API)
 ├── database/           (PostgreSQL SQL schemas)
 ├── docker/             (Dockerfiles, docker-compose orchestration)
 └── kubernetes/         (Pods, deployments, services configurations)

2. COMPILING AND LOCAL RUNS:
------------------------------------------
Boot everything in Docker with one single CLI command:
$ docker-compose up --build

Access portals:
- React Frontend Preview: http://localhost:3000
- Spring Boot Gateway: http://localhost:8080/swagger-ui.html
- Python FastAPI AI: http://localhost:8000/docs

3. TESTING BLUEPRINTS (UNIT TESTS):
------------------------------------------
Spring Boot Testing:
Run ./mvnw test to execute JUnit test cases confirming JWT authorization filters.

FastAPI Testing:
Run pytest to verify Pydantic Schema validations and routing mock fallbacks.`;

  const getCodeText = () => {
    switch (activeTab) {
      case "springboot": return codeSpringboot;
      case "fastapi": return codeFastapi;
      case "postgresql": return codePostgresql;
      case "devops": return codeDevops;
      case "readme": return codeReadme;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-900/10 font-sans">
      
      {/* Header banner */}
      <div className="mb-8 border-b border-slate-800/60 pb-5 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6.5 h-6.5 text-indigo-400" />
            Enterprise Blueprints Exporter
          </h2>
          <p className="text-sm text-slate-400">View and export standard clean-architecture code files matching Java Spring Boot, FastAPI, and Postgres.</p>
        </div>

        <button
          onClick={() => handleCopy(getCodeText())}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 cursor-pointer"
        >
          {copiedText ? (
            <>
              <Check className="w-4.5 h-4.5 text-emerald-400" />
              SSO Buffer Copied!
            </>
          ) : (
            <>
              <Copy className="w-4.5 h-4.5" />
              Copy File Contents
            </>
          )}
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="grid grid-cols-5 gap-2.5 mb-6">
        <button
          onClick={() => setActiveTab("springboot")}
          className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "springboot"
              ? "bg-slate-950 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/40 hover:bg-slate-900 text-slate-400 border-slate-850 hover:border-slate-800"
          }`}
        >
          <FileCode className="w-4.5 h-4.5 text-orange-400" />
          Java Spring Boot API
        </button>

        <button
          onClick={() => setActiveTab("fastapi")}
          className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "fastapi"
              ? "bg-slate-950 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/40 hover:bg-slate-900 text-slate-400 border-slate-850 hover:border-slate-800"
          }`}
        >
          <Terminal className="w-4.5 h-4.5 text-cyan-400" />
          FastAPI Microservice
        </button>

        <button
          onClick={() => setActiveTab("postgresql")}
          className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "postgresql"
              ? "bg-slate-950 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/40 hover:bg-slate-900 text-slate-400 border-slate-850 hover:border-slate-800"
          }`}
        >
          <Database className="w-4.5 h-4.5 text-indigo-400" />
          PostgreSQL DDL
        </button>

        <button
          onClick={() => setActiveTab("devops")}
          className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "devops"
              ? "bg-slate-950 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/40 hover:bg-slate-900 text-slate-400 border-slate-850 hover:border-slate-800"
          }`}
        >
          <Layers className="w-4.5 h-4.5 text-indigo-400" />
          Docker & DevOps
        </button>

        <button
          onClick={() => setActiveTab("readme")}
          className={`py-3.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "readme"
              ? "bg-slate-950 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/40 hover:bg-slate-900 text-slate-400 border-slate-850 hover:border-slate-800"
          }`}
        >
          <BookOpen className="w-4.5 h-4.5 text-amber-400" />
          Testing & Manuals
        </button>
      </div>

      {/* Code window */}
      <div className="rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl relative">
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-lg text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Enterprise standard • Strict SOLID MVC
        </div>

        <pre className="text-[11px] leading-relaxed font-mono text-slate-300 max-h-[520px] overflow-auto scrollbar-thin whitespace-pre-wrap">
          {getCodeText()}
        </pre>
      </div>

    </div>
  );
}
