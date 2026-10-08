# AEObility Social Calendar User Flow

This document maps out the core user journey, starting from the **Repurposing Pipeline**, through generation, styling, auditing, and finally dispatching to the content calendar.

## 🗺️ User Flow Diagram

```mermaid
flowchart TD
    %% Styling
    classDef primary fill:#00E5FF,stroke:#00E5FF,stroke-width:2px,color:#000
    classDef secondary fill:#1E293B,stroke:#334155,stroke-width:2px,color:#FFF
    classDef action fill:#059669,stroke:#047857,stroke-width:2px,color:#FFF
    classDef studio fill:#FF007A,stroke:#FF007A,stroke-width:2px,color:#FFF
    classDef gatekeeper fill:#7B2EFF,stroke:#7B2EFF,stroke-width:2px,color:#FFF

    %% Start
    Start((Log In)):::secondary --> Pipeline[Open Pipeline Tab]:::primary

    %% Step 1-2
    subgraph Pipeline Stage
        Pipeline --> Step1[Step 1: Select Webpage to Repurpose]:::secondary
        Step1 --> Step2[Step 2: Toggle Content Angles]:::secondary
        Step2 --> Step3[Step 3: Choose Global Design Style]:::secondary
        Step3 --> Generate{Click Generate Bundle}:::action
    end

    %% Step 3 Output
    Generate -->|Synthesizing| Output[Output Tray Populates 5 Tabs]:::secondary
    Output --> LI[LinkedIn Tab]:::secondary
    Output --> IG[Instagram Tab]:::secondary
    Output --> FB[Facebook Tab]:::secondary
    Output --> YT[YouTube Tab]:::secondary
    Output --> GMB[Google Business Tab]:::secondary

    %% Graphic Studio Flow (Inline Modal)
    IG -->|Click '🎨 Graphic Studio'| Studio[Open Studio Drawer Overlay]:::studio
    Studio --> Customize[Tweak Layers, Assets, & Text]:::studio
    Customize --> SaveCreative[Save Asset Link & Close Drawer]:::action
    SaveCreative --> Output

    %% Gatekeeper Flow (Inline Modal)
    LI -->|Click '🛡️ Brand Voice'| Gatekeeper[Open Gatekeeper Drawer Overlay]:::gatekeeper
    FB --> Gatekeeper
    Gatekeeper --> Audit[Score Tone & Apply Edits]:::gatekeeper
    Audit --> Output

    %% Calendar Dispatch
    Output -->|Granular 'Send to Calendar'| Calendar[Push Ready Statuses]:::action
    Output -->|Batch 'Dispatch Ready'| Calendar
    Calendar --> Review[Open Calendar Tab to Review Grid]:::secondary
    Review --> Publish((Publish / Schedule)):::primary
```

## 🚶 Step-by-Step Walkthrough

**1. The Setup (Pipeline)**
* The user lands on the **Pipeline** tab.
* They select an existing Knowledge Base article (e.g., a whitepaper or blog post) from the "Source Link" dropdown.
* They click the **Content Angle** pills (e.g., "Vector Chunking", "Lost-in-the-Middle") to steer the AI's focus.
* They select a global **Design Style** (e.g., "Style A: Dark Cinematic"). Note: Aspect ratios are no longer global; they adapt automatically per channel.

**2. The Generation (Output Tray)**
* The user hits the big **Generate 5-Channel Bundle** button.
* After a few seconds, the Output Tray populates with 5 separate tabs containing platform-optimized copy for LinkedIn, Instagram, Facebook, YouTube, and Google Business.

**3. The Polish (Inline Overlay Drawers)**
* **Graphics:** The user clicks **"🎨 Graphic Studio"** on the Instagram tab. A slide-over drawer opens *without leaving the pipeline*, pre-loading their exact text, global design style, and the channel's optimal aspect ratio (4:5). They tweak the layout, hit Save, the drawer closes, and they are back exactly where they were in the pipeline.
* **Copy:** The user clicks **"🛡️ Brand Voice"** on the LinkedIn tab. The Gatekeeper drawer slides over, scoring the text and suggesting inline edits. Applying edits updates the main pipeline state.

**4. The Dispatch (Granular & Batch)**
* Instead of a rigid "Send All" action, users can hit **"Send to Calendar"** on individual ready channels.
* Or, they use the master status bar at the bottom to bulk **"Dispatch Ready (X/5)"**.
* Finally, they navigate to the **Calendar & Dispatch** tab to see their new posts neatly organized in a Kanban or list view, ready for final approval.
