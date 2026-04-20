const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


// const interviewReportSchema = z.object({
//     matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
//     technicalQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
//     behavioralQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
//     skillGaps: z.array(z.object({
//         skill: z.string().describe("The skill which the candidate is lacking"),
//         severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
//     })).describe("List of skill gaps in the candidate's profile along with their severity"),
//     preparationPlan: z.array(z.object({
//         day: z.number().describe("The day number in the preparation plan, starting from 1"),
//         focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
//         tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
//     })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively")
// })

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert interview report generator. Generate a detailed interview report for a candidate.

CANDIDATE INFORMATION:
Resume: ${resume}

Self Description: ${selfDescription}

Job Description: ${jobDescription}

YOU MUST RETURN ONLY VALID JSON IN THIS EXACT STRUCTURE:

{
  "matchScore": <number between 0-100>,
  "title": "<job title from job description>",
  "technicalQuestions": [
    {
      "question": "<the question>",
      "intention": "<why ask this>",
      "answer": "<how to answer>"
    },
    ... 3-4 more questions ...
  ],
  "behavioralQuestions": [
    {
      "question": "<the question>",
      "intention": "<why ask this>",
      "answer": "<how to answer>"
    },
    ... 3-4 more questions ...
  ],
  "skillGaps": [
    {
      "skill": "<skill name>",
      "severity": "low" OR "medium" OR "high"
    },
    ... 2-3 more skills ...
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "<focus area>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    {
      "day": 2,
      "focus": "<focus area>",
      "tasks": ["<task 1>", "<task 2>", "<task 3>"]
    },
    ... more days up to day 3 ...
  ]
}

ABSOLUTE REQUIREMENTS:
- Return ONLY the JSON object, no other text
- title MUST be a string containing the job title
- technicalQuestions MUST be array of objects with "question", "intention", "answer"
- behavioralQuestions MUST be array of objects with "question", "intention", "answer"
- skillGaps MUST be array of objects with "skill" (string) and "severity" (low|medium|high)
- preparationPlan MUST be array of objects with "day" (number), "focus" (string), "tasks" (array of strings)
- NO escaped quotes, NO malformed JSON
- Each question/answer should be 1-2 sentences
- 3-4 technical questions, 3-4 behavioral, 2-3 skill gaps, 3 days of preparation`

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        })

        const responseText = response.text
        return(JSON.parse(responseText))
        
       
    } catch (error) {
        console.error("Error generating interview report:", error.message)
        throw error
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    // return JSON.parse(response.text);

    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = {generateInterviewReport, generateResumePdf}