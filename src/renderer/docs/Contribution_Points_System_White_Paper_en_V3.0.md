# **Contribution Points System Whitepaper (V3.0)**

## **0. Introduction: Core Philosophy & Legal Foundation**

This system is designed as a principled framework to incentivize global contributors to participate in the construction of "Software (Open Source)" and "Core Worldview (IP Exclusive)" using SPCP (Serverless Project Contribution Platform). Users can adjust the specific settings and values according to their own needs.

This system does not require the issuance of any virtual currency. Points are stored in plain text within the public Github organization repository, accessible for anyone to view at any time.

To achieve the goals of **Flexibility, Transparency, Fairness, and Justice**, this system does not rely on rigid algorithms. Instead, it depends on a core "Contribution Review Committee (CRC)" and incorporates an innovative "Dual-Track Points" model to ensure all contributions are reasonably valued.

> **【Legal Cornerstone】** All contributors must sign a **Contributor License Agreement (CLA)**, ensuring that the copyright/patent rights of their code/IP contributions are granted to the project owner. This is the **absolute prerequisite** for the effective operation of the points system and the safe use of these contributions by the project. Any violation of the CLA will directly trigger the highest level of penalty for "Malicious Intent."

---

## **1. Contribution Points System (CPS) General Rules**

### **1.1 Dual-Track Points System**

This system contains two distinct types of points, which are **issued simultaneously at a 1:1 ratio** to contributors:

1.  **Honor Points (HP):**
    *   **Nature:** Permanently cumulative, never reset.
    *   **Purpose:** Represents the contributor's **total historical contribution** and **status** within the community, and serves as a secondary basis for the distribution of the "Contributor Reward Fund." During the annual settlement, the Foundation will allocate 10% of the distributable bonus pool as cash rewards based on the proportion of HP held by contributors.
    *   **Usage:** Serves as the sole basis for the "Contributor Progression Ladder," used to unlock community status, governance rights (e.g., election as a council member), and honorary attribution.

2.  **Redeemable Points (RP):**
    *   **Nature:** **Settled Annually, Reset Periodically.**
    *   **Purpose:** Represents the value of the contributor's **active contributions within the current cycle.**
    *   **Usage:** Serves as the primary basis for the distribution of the "Contributor Reward Fund." During the annual settlement, the Foundation will allocate 90% of the distributable bonus pool as cash rewards based on the proportion of RP held by contributors. After settlement, everyone's RP balance is reset to zero, and the next cycle begins. If there is no settlement in a given year, RP will not reset and will carry over until the first settlement year occurs.
    *   **Tax Declaration:** Cash rewards distributed by the Foundation are **pre-tax amounts**. Contributors are responsible for declaring and paying any applicable taxes according to the laws of their jurisdiction.

> **[Design Principle]** This design balances the recognition of status for "Veteran Contributors" (HP) with incentive fairness for "New Contributors" (RP).

### **1.2 Contribution Review Committee (CRC)**

The CRC is the core of fairness and quality in this system.

*   **Composition & Term:** Composed of early core contributors appointed by the Foundation and **representatives elected by the community.** Elected members serve a term of **2 years** and can be re-elected for a maximum of one consecutive term. Elections are conducted by votes from contributors who have reached a certain HP level.
*   **Responsibilities:**
    1.  Review all merged/accepted contributions.
    2.  Assign points (HP and RP) to contributions based on the "Contribution Valuation Guide" in Chapter 2 of this whitepaper.
    3.  Manage and adjudicate appeals related to points.
    4.  Issue and manage "Point Bounty" tasks.
*   **Work Cycle & Service Level Agreement (SLA):** The CRC operates on a standard **weekly** work cycle, holding regular meetings to review contributions from the past week. It commits to completing the CRC review and distributing points within **10 business days** after a contribution is accepted.
*   **Conflict of Interest Avoidance:** CRC members must **recuse themselves** from reviewing contributions they participated in or have a close association with. Such contributions will be reviewed by other members.

### **1.3 Project Maintainers & IP Editors**

"Maintainers" and "IP Editors" in this project are core contributors certified by the Foundation or CRC, possessing **Merge and Accept permissions** for specific repositories or IP content. They are key quality controllers and gatekeepers in the contribution workflow.

*   **Dual Roles:**
    1.  **As Contributors:** The code, IP, etc., they submit personally are reviewed and scored by the CRC based on the "Contribution Valuation Guide," just like any other contributor.
    2.  **As Maintainers/Editors:** They perform the duty of **reviewing, guiding, and merging** others' contributions. This work should receive separate governance points.

*   **Qualification & Appointment:** Typically appointed by the Foundation or CRC from among **Core Contributors**, based on their expertise and community trust.

### **1.4 Public Ledger**

**Justice** stems from **Transparency**. All point distribution records (including contribution link, contributor, points awarded, reason for award, CRC member responsible for review) must be published on a public page, subject to supervision by all community members. **For any Impact Multiplier rating other than 1.0, the CRC must write a brief comment** explaining the rationale.

---

## **2. Contribution Valuation Guide (Rubric)**

The CRC does not rely on a fixed points table but uses a flexible valuation model to assess all types of contributions (Code, IP, Community).

### **2.1 Core Valuation Model**

The CRC's assessment of each contribution is a two-step process. The final score is calculated using the following formula:

**`Total Points = Base Effort (Base Points) × Impact Multiplier`**

*   **Base Effort (Base Points):** Assesses the **time, effort, and inherent complexity** required for the task (i.e., the "effort points"). Objective anchors (like lines of code, word count, number of illustrations) can be referenced, but the **final assessment should be based on the actual complexity and required skill level of the contribution.**
*   **Impact Multiplier (Impact Multiplier):** Assesses the **quality, strategic value, and actual effect** of the contribution (i.e., the "merit coefficient"). Any multiplier other than 1.0 must be accompanied by a written comment.

### **2.2 Table 1: Base Effort (Base Points) Guide**

The CRC uses a "T-Shirt Sizing" method, referencing objective anchors, to grade the objective effort of a contribution: (Point values are for reference)

| Size | Base Points | A. Code Contribution (Examples & Reference) | B. IP & Worldview (Examples & Reference) | C. Community & Operations (Examples & Reference) |
| :--- | :--- | :--- | :--- | :--- |
| **S** | 20 - 100 | Fixing doc typos, minor UI tweaks, simple bug fixes (PR)<br>*(Ref: < 100 LOC)* | Submitting a small item's design, factual correction to existing lore<br>*(Ref: < 500 words)* | Translating a short announcement/email (< 1000 words), single small-scale online Q&A event, routine moderation tasks (weekly)<br>*(Ref: Time < 3 hours)* |
| **M** | 100 - 400 | Implementing a small new feature, non-core performance optimization, writing unit tests<br>*(Ref: 100-500 LOC)* | Designing a detailed description of a location/organization, drawing a concept sketch<br>*(Ref: 500-2000 words or 1-2 images)* | Writing a technical/worldview tutorial, translating a long development document (~2000-5000 words), organizing a medium-sized event (e.g., themed discussion week)<br>*(Ref: Time 3-10 hours)* |
| **L** | 400 - 1000 | Implementing a core module, fixing a critical security vulnerability, code refactoring<br>*(Ref: 500-2000 LOC)* | Designing a complete set for a new species/faction, writing a key short story<br>*(Ref: 2000-10000 words or a set of designs)* | Producing a high-quality tutorial/promotional video, planning and executing a large online event (e.g., Game Jam), serving as a language community lead and completing monthly work<br>*(Ref: Time 10-40 hours)* |
| **XL** | 1000 - 3000 | Developing a complete new system (e.g., AI, rendering pipeline)<br>*(Ref: >2000 LOC)* | Writing a complete main storyline script, drawing a full set of character reference sheets/scene art<br>*(Ref: >10000 words or a set of artwork)* | Formulating and implementing an important community policy, leading a quarterly community growth plan and producing a complete report, designing the full UI/UX scheme for a product<br>*(Ref: Time 40-120 hours)* |
| **XXL** | 3000+ | Porting to a new platform, rewriting the core engine (Special bounty by CRC/Foundation) | Constructing a completely new, complete branch of the worldview (Special bounty by CRC) | Building and successfully operating a large regional/language community from scratch (e.g., Japanese/French division) (Special bounty by CRC) |

---

### **2.3 Table 2: Impact Multiplier Guide**

After assigning the "Base Points," the CRC selects a multiplier based on the contribution's **actual value**, and **must attach a written comment**. The following is a general multiplier guide applicable to all contribution types:

| Multiplier | Level | Applicable Criteria (CRC Judgment Basis) |
| :--- | :--- | :--- |
| **x <=0.1** | **Consolation** | **Submitted but not accepted.** Acknowledges the contributor's effort ("effort"). E.g., submitted a duplicate PR, or submitted very low-quality IP lore that took considerable time. **For Type C:** Organized an event with zero participation; wrote a tutorial full of factual errors that was not used. |
| **x <=0.5** | **Auxiliary** | **Not accepted, but provided valuable insights.** E.g., in a "bounty," although their solution wasn't used, their ideas inspired the final solution. **For Type C:** Proposed an event plan that wasn't adopted but offered a new perspective; assisted others in completing part of community work. |
| **x <=1.0** | **Standard Acceptance** | **Default value.** The contribution meets requirements and is merged/accepted. E.g., a qualified bug fix, an accepted piece of lore, a decent short story. **For Type C:** Event executed smoothly, meeting expectations; tutorial content was accurate and helped some users; routine moderation work completed satisfactorily. |
| **x 1.0 - 2.0** | **High Quality** | **Exceeds expectations.** Code quality is exceptionally high, architecture is clear; IP design is highly creative and complete; community tutorial is very popular. **For Type C:** Event participation far exceeded expectations, receiving widespread praise; tutorial/video became a must-read guide in its field, officially recommended; effectively resolved a major community conflict. |
| **x 2.0 - 5.0** | **Strategic** | **Foundational value.** Solved a core technical challenge; IP design became a pillar of the worldview (e.g., key architecture); event attracted a significant number of core contributors. **For Type C:** The organized event directly attracted **a group** of high-quality new contributors; the established community policy significantly improved collaboration efficiency or community atmosphere; the produced promotional material was widely disseminated, greatly enhancing project visibility. |
| **x 5.0 - 10.0+** | **Phenomenal** | **Triggered viral spread or brought immense success to the project.** E.g., the developed game became a breakout hit. This multiplier usually needs to be **retroactively awarded** by the CRC, subject to council approval. **For Type C:** Organized a global event that attracted phenomenal attention, widely covered by mainstream media; operational strategy led to an order-of-magnitude growth in community users/contributors. |

---

### **【Type C Contribution Assessment Supplementary Notes】**

1.  **Performance-Based & Work Reports:** For ongoing roles like moderators, community managers, their points are strictly settled based on **Monthly/Quarterly Work Reports**. Reports should clearly list main tasks completed during the period, time spent, and quantifiable results (e.g., resolved X disputes, organized Y events, wrote Z documents). The CRC treats the report content as a collection of independent contributions and assesses them item-by-item or holistically according to this guide.
2.  **Result-Oriented:** The assessment of Type C contributions should **strongly favor outcomes and impact** over mere time invested. A long but poorly attended event has less value than a well-planned, highly effective small event.
3.  **Quantifiable Evidence:** Type C contributors are encouraged to attach quantifiable evidence when submitting contributions or work reports, such as: event participation numbers, tutorial readership/likes, community growth statistics, screenshots of positive user feedback, etc. This helps the CRC assess the "Impact Multiplier" more objectively.

---

### **【Maintainer & IP Editor Assessment Supplementary Notes】**

1.  **Core Value is Empowerment:** This system aims to incentivize maintainers/editors to **cultivate more contributors**, not just process PRs efficiently. A maintainer who can elevate an "S-size" contribution to an "M-size" through excellent guidance is far more valuable than one who only handles "XL-size" contributions but never interacts.
2.  **Division of Labor with CRC:** Maintainers/Editors are the **first quality gate**, ensuring contributions are technically and factually correct and usable. The CRC is the **second value gate**, determining the final points from a more macro strategic and community value perspective. The two complement each other.
3.  **Performance Evaluation:** The performance of maintainers/editors will be part of the CRC's performance evaluation, subject to community feedback and random sampling review by the council. Persistent erroneous merges or lack of interaction may lead to a re-evaluation of their qualifications.

## **3. System Operation & Processes**

### **3.1 Contribution Workflow**
1.  **Submit:** Contributors submit contributions via official channels like GitHub or SPCP.
2.  **Accept:** Contributions are accepted/merged by project Maintainers or IP Editors.
3.  **Review:** The CRC reviews all "Accepted" contributions weekly.
4.  **Assign Points:** The CRC assigns points (HP and RP) based on the "Valuation Guide".
5.  **Publicize:** Point distribution results are recorded in the "Public Ledger".

### **3.2 "Point Bounties" Mechanism**
To achieve **flexibility** and guide the community to tackle specific challenges, the Foundation or CRC can proactively create "Bounty Tasks".
*   **Publication & Discussion:** The CRC publishes a draft of a specific task, including a **community discussion period** (e.g., 3-5 days) to gather feedback on the task scope and pre-assigned points.
*   **Final Publication:** After adjusting based on feedback, the CRC publishes the final bounty. Points can be a fixed value, or for complex tasks, declare a **floating range** (e.g., 400-600 points).
*   **Allocation:**
    *   The first contributor whose submission is accepted receives the full points (or, within the floating range, an amount based on quality).
    *   **(Split Mechanism)** If the CRC determines that multiple (unaccepted) solutions also provided valuable insights, the CRC has the authority to use additional points to grant these solutions an "Auxiliary" score of `x 0.5`.

### **3.3 Annual Settlement**
1.  **Cycle:** The settlement cycle runs from **January 1st to December 31st** each year. The Foundation will complete the settlement and reward distribution by **January 31st of the following year**.
2.  **Bonus Pool:** The Foundation will inject **100%** of annual donations and sponsorship funds, and **70%** of project revenue, into the "Contributor Reward Fund," and publicly announce the estimated total to the community at the beginning of the cycle.
3.  **Settlement Formula:** Each contributor's reward = `(Individual RP / Total RP) × Total Bonus Pool`.
4.  **Reset:** After rewards are distributed, **everyone's RP balance is reset to zero**. HP remains unchanged.

### **3.4 Governance Contribution Points**

Council and CRC members participate in this system with **dual identities**:
1.  **As Contributors:** Their submitted code, IP, and other regular contributions are reviewed by the CRC (which must recuse itself from their own contributions) according to the "Contribution Valuation Guide," like all members.
2.  **As Governors:** Their governance responsibilities earn points.

#### **A. Council Members**

| Contribution Type | Points Mechanism | Explanation |
| :--- | :--- | :--- |
| **Strategic Meetings** | **Fixed Points/Hour** | Participation in formal strategic/operational meetings, awarded based on effective time (e.g., **100 P/hour**). |
| **Arbitrating Appeals** | **Fixed Points/Case** | Handling a formal appeal case, awarded based on complexity (e.g., **S-type: 50 P, M-type: 200 P**). |
| **Community Governance** | **Assessed per《Guide》** | Specific outputs like published reports, plans, etc., are assessed as Type C contributions. |

#### **B. Contribution Review Committee (CRC) Members**

CRC review work adopts a **"Base Points + Quality Multiplier"** model:
**CRC Review Points = Review Base Points × Quality Multiplier**

*   **Review Base Points:** Calculated as **10% of the "Base Effort" points** of the contribution being reviewed.
    *   Example: Reviewing a "Large" contribution with a base effort of 600 points yields base points of `600 × 10% = 60 points`.
*   **Quality Multiplier:**
    *   **x 0.5 (Needs Improvement):** Review was appealed and the **appeal was successful**, or a spot check deemed the comment perfunctory.
    *   **x 1.0 (Standard):** Default value. Review completed on time, comments are clear.
    *   **x 1.5 (High Quality):** Comments are detailed, provided constructive guidance, received positive feedback from the contributor.
    *   **x 2.0 (Exemplary):** Handled a complex dispute case, and the ruling set a precedent for future cases (retroactively awarded by the Council).

#### **C. Project Maintainers & IP Editors**

The core work of Maintainers/Editors is **reviewing and merging** contributions. Their points design follows a philosophy similar to the CRC's "**Base Points + Quality Multiplier**" but focuses on their unique responsibilities.

**Maintainer/Editor Points = Handling Base Points × Quality Multiplier**

**1. Handling Base Points: Based on the value of the work handled**
*   **Design Rationale:** The effort of reviewing, guiding, and merging a contribution is positively correlated with the complexity and value of the contribution itself.
*   **Mechanism:** The handling base points are directly linked to a fixed percentage of the **"Total Points" ultimately awarded to the processed contribution** (i.e., `Base Points × Impact Multiplier`).
*   **Suggested Percentage:** **5%**. This ratio is lower than the CRC's (10%) because the Maintainer/Editor's review focuses more on technical/IP correctness and merge readiness, while the CRC's review is the final, cross-domain value judgment.
    *   Example: Maintainer M processes a contribution that ultimately receives `600 (Base) × 1.5 (High Quality) = 900 points`. Their **Handling Base Points** for this task are `900 × 5% = 45 points`.

**2. Quality Multiplier: Based on the quality of the handling work**
*   **Design Rationale:** Incentivizes Maintainers/Editors to provide high-quality guidance, not just click the merge button.

| Multiplier | Level | Trigger Conditions |
| :--- | :--- | :--- |
| **x 0.5** | **Needs Improvement** | **Erroneous Merge:** Merged a contribution with obvious flaws (e.g., causes build failure,严重违反设定) that was later reverted or required emergency fixes. |
| **x 1.0** | **Standard** | **Default value.** Review was timely, necessary feedback was provided, merge complied with standards. |
| **x 1.5** | **High Quality** | **Exceptional Guidance:** Provided feedback that exceeded expectations, was detailed and instructive, significantly improved the final quality of the contribution, and received praise from the contributor. |
| **x 2.0** | **Exemplary** | **Mentorship:** The guidance process during a complex contribution became a model for collaboration, or successfully nurtured a novice contributor into a regular. |

**Maintainer/Editor Points Calculation Example:**
*   A Maintainer processes a contribution ultimately worth 300 points and provides high-quality guidance.
    *   Points = `(300 × 5%) × 1.5 = 15 × 1.5 = 22.5 RP & HP`.

#### **D. Execution & Transparency** (This section was originally part C, content expanded)
*   All governance points (Council, CRC, Maintainer/Editor) are **listed separately in the "Public Ledger" with clear labeling of the role and contribution type**.
*   Strict adherence to the **Recusal Principle**. Maintainers/Editors cannot perform the merge operation on their own submissions, nor can they assign points for their own governance work.
*   The total points and per-capita averages for various governance roles should be published in the annual report as one of the "System Health Indicators."
*   The Foundation will publish monthly metrics (Active Contributor Count, Average Review Time, Appeal Rate, RP Unit Value).

---

## **4. Governance & Arbitration (Fairness & Justice)**

### **4.1 Appeal & Arbitration Process**
Contributors have the right to appeal if they disagree with the CRC's points assessment.

1.  **Internal CRC Appeal (Within 7 days):** The contributor should first initiate a public discussion on the corresponding entry in the "Public Ledger," requesting a re-evaluation. The CRC must publicly respond and provide a review decision within 7 days.
2.  **Council Arbitration (Within 14 days):** If the contributor is still dissatisfied with the CRC's review decision, they can submit a formal arbitration request to the **Foundation Council**. The Council's decision is final.

### **4.2 Negative Incentive Framework**
To maintain community integrity, a penalty mechanism for destructive behavior must be established.

#### **A. Negligence**
*   **Definition:** Unintentional mistakes, not主观故意.
*   **Penalty:**
    1.  Deduct RP equal to or double the points of the contribution in question (RP can go negative).
    2.  **Effectiveness Buffer:** Any negative points penalty, after being publicized, has a **7-day "Effectiveness Waiting Period"**. During this period, the contributor can file an appeal, and the penalty is temporarily not executed.

#### **B. Malicious Intent**
*   **Definition:** Intentional sabotage, fraud, plagiarism, bullying, or serious violations of the CLA, etc.
*   **Penalty (Escalating):**
    1.  **[Warning]** Immediately reset **all RP** for the current contribution cycle.
    2.  **[Demotion]** Significantly deduct **HP**, leading to **demotion** in the progression ladder.
    3.  **[Public Listing]** Recorded in the "Public Ledger" blacklist.
    4.  **[Ban]** For extremely severe cases, the Council votes to decide on a **permanent ban**.

---

## **5. Governor Performance & Checks and Balances**

To ensure the Council and CRC continue to perform their duties fairly, the following performance assessment and checks and balances mechanisms are established.

### **5.1 CRC Performance Assessment**

**A. Assessment Cycle:** Every six months.

**B. Assessors & Method:**
*   **Community Feedback (40% weight):** Anonymous questionnaires distributed to core contributors, assessing review timeliness, quality, communication attitude, and fairness.
*   **Council Review (60% weight):** Sampling review of the CRC's decision quality, workload, appeal rate, and appeal success rate.

**C. Result Application:**
*   Excellent/Good performers receive recognition or HP incentives.
*   For underperforming elected members, the Council may initiate a **community recall procedure**.

### **5.2 Council Performance Assessment**

**A. Assessment Cycle:** Annually.

**B. Assessors & Method:**
*   **Internal Peer Review (30% weight):** Anonymous peer assessment of collaboration and contribution.
*   **Community Trust Vote (40% weight):** Conducted by core contributors. A high number of "No Confidence" votes requires public reflection and corrective actions.
*   **System Health Indicators (30% weight):** Assessment based on objective data like contributor growth rate, retention rate, community activity level, appeal rate, etc.

**C. Result Application:** Primarily used for strategic calibration and internal improvement.

---

## **6. Future Development & Scalability**

### **6.1 Contributor Progression Ladder**
"Honor Points" (HP) will automatically unlock tiered status for contributors within the community (e.g., Novice Contributor -> Core Contributor -> Elder/Council Member), granting them corresponding governance rights.

### **6.2 CRC Tiered Review Mechanism**
When the community scales up and contribution volume surges, to prevent the CRC from becoming a bottleneck, a tiered review will be activated:

*   **L1 Review (Community):** "Core Contributors" (defined by the HP ladder) are authorized to review S and M size contributions from "Novice Contributors."
*   **L2 Review (CRC):** The CRC will focus on reviewing L1 review results and concentrate on evaluating L, XL, XXL size major contributions.

---

**[Whitepaper V3.0 End]**
**Update Summary:**
1.  **Strengthened Legal Foundation:** Clarified the absolute prerequisite status of the CLA in the introduction.
2.  **Refined CRC Operation:** Specified terms, elections, SLA (review within 10 business days), and conflict of interest principles.
3.  **Optimized Valuation Guide:** Introduced objective calibration anchors for Base Effort and mandated written comments for Impact Multipliers.
4.  **Improved Bounty Mechanism:** Added community discussion periods and floating bounty mechanisms.
5.  **Clarified Settlement Details:** Defined the calendar year settlement cycle and clarified the bonus pool sources.
6.  **Enhanced Fairness Safeguards:** Introduced a 7-day "Effectiveness Waiting Period" for negative incentives.
7.  **Added Tax Notice:** Included a tax declaration in the RP usage section.

This version systematically integrates all key optimization suggestions, forming a more rigorous, transparent, and operational complete framework.