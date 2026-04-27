import os
import asyncio
from google.adk import Agent, Runner
from google.adk.tools import AgentTool
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from counterfactual_architect import counterfactual_architect

# 1. Define Specialist for Complaint Letters
complaint_officer = Agent(
    model='gemini-2.0-flash',
    name='complaint_officer',
    description="An agent that drafts formal RBI-compliant complaint letters.",
    instruction=(
        "You are an expert in Indian banking regulations. When provided with evidence "
        "of credit bias (like a bias gap), draft a formal complaint letter to the "
        "Bank's Nodal Officer. Ensure it follows RBI's Integrated Ombudsman Scheme guidelines."
    )
)

# 2. Wrap Specialists as Tools for the Coordinator
architect_tool = AgentTool(agent=counterfactual_architect)
officer_tool = AgentTool(agent=complaint_officer)

# 3. Define the Team Coordinator
fairness_coordinator = Agent(
    model='gemini-2.0-flash',
    name='fairness_coordinator',
    description="The central orchestrator for credit fairness analysis.",
    instruction=(
        "You are the Lead Fairness Coordinator for CREFAH. Your mission is to help "
        "users understand and challenge credit bias. \n"
        "1. First, use the 'counterfactual_architect' to analyze the user's profile "
        "and reveal any geographic bias.\n"
        "2. If a significant bias gap is found, use the 'complaint_officer' to "
        "draft a formal challenge for the user.\n"
        "3. Present the findings and the letter to the user in a professional manner."
    ),
    tools=[architect_tool, officer_tool]
)

async def run_test():
    # Set the API key
    os.environ["GOOGLE_API_KEY"] = "AIzaSyAROyIO03AjbMKsnPgbNbS0N9s7o3st448"
    
    # Initialize services
    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name="CREFAH-Orchestrator",
        user_id="user_123",
        session_id="session_abc"
    )
    
    runner = Runner(
        agent=fairness_coordinator,
        session_service=session_service,
        app_name="CREFAH-Orchestrator"
    )
    
    print("\n--- Starting CREFAH Orchestration Test (Async) ---")
    
    # Define message as a structured Content object
    prompt_content = Content(
        role="user",
        parts=[Part(text="Analyze my profile: I live in a Rural area, earn $45,000 as a Freelancer, and have a credit score of 720. I'm worried about bias.")]
    )
    
    # ADK 1.31 uses runner.run with new_message, returns a generator
    try:
        for event in runner.run(
            user_id="user_123",
            session_id="session_abc",
            new_message=prompt_content
        ):
            if hasattr(event, 'text') and event.text:
                print(event.text, end="", flush=True)
    except Exception as e:
        print(f"\n[Execution Error]: {str(e)}")
            
    print("\n\n--- Test Complete ---")

if __name__ == "__main__":
    asyncio.run(run_test())
