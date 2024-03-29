import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import ReactMarkdown from 'react-markdown';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import Select from 'react-select';

export type StreamingCompletionsProps = {
    systemPrompt: string;
    userPrompt: string;
    debugFlag: boolean;
};

export type StreamingCompletionsHandle = {
    runGenerate: (systemPrompt: string, userPrompt: string, debugFlag: boolean ) => Promise<void>;
    clear: () => void;
    stopGenerate: () => void;
    // updateApiKey: (newKey: string) => void;
};

const StreamingCompletions = forwardRef<
StreamingCompletionsHandle, 
StreamingCompletionsProps
>((props, ref) => {

    const [combinedPrompt, setCombinedPrompt] = useState("");
    const [debugFlag, setDebugFlag] = useState(false);

    const [result, setResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [tokenCount, setTokenCount] = useState(0)

    const [API_KEY, setAPI_KEY] = useState(''); 
    const [API_URL, setAPI_URL] = useState("https://api.openai.com/v1/chat/completions"); 
    const controllerRef = useRef<null | AbortController>(null);


    useImperativeHandle(ref, () => ({
        async runGenerate() {
            console.log("runGenerate called with systemPrompt", props.systemPrompt);
            console.log("runGenerate called with userPrompt", props.userPrompt);

            // setResult("");
            await setCombinedPrompt(`${props.systemPrompt}\n${props.userPrompt}`);
            setDebugFlag(props.debugFlag)
            await generate(combinedPrompt, provider)

        },
        clear() {
            setResult("");
            setTokenCount(0)
            setElapsedTime(0)
        },
        stopGenerate() {
            stop();
        },
        // updateApiKey(newKey: string) {
        //     setAPI_KEY(newKey);
        //  }
    }));

    const providers = [ 
        {
            value: "OpenAI", label: "OpenAI", 
            implemented: true
        },
        {
            value: "NVIDIA AI Playground", label: "NVIDIA AI Playground",
            implemented: false
        },
        {
            value: "Amazon Bedrock", label: "Amazon Bedrock",
            implemented: false
        },
        {
            value: "Google Vertex AI", label: "Google Vertex AI",
            implemented: false
        },
        {
            value: "Lepton AI", label: "Lepton AI",
            implemented: false
        },
        {
            value: "HuggingFace Spaces", label: "HuggingFace Spaces",
            implemented: false
        },
        {
            value: "HuggingFace Interface Pro", label: "HuggingFace Interface Pro",
            implemented: false
        },
        {
            value: "Together.ai", label: "Together.ai",
            implemented: false
        },
        {
            value: "Replicate", label: "Replicate",
            implemented: false
        },
        {
            value: "Fireworks.ai", label: "Fireworks.ai",
            implemented: false
        },
        {
            value: "OctoAI", labe: "OctoAI",
            implemented: false
        },
    ]

    const openAIModelOptions = [
        // GPT 4 models...
        { 
          value: 'gpt-4-1106-preview', label: 'gpt-4-1106-preview', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '128,000', data: 'Apr 2023' 
        },
        { 
          value: 'gpt-4-vision-preview', label: 'gpt-4-vision-preview', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '128,000', data: 'Apr 2023' 
        },
        { 
          value: 'gpt-4', label: 'gpt-4', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '8,192', data: 'Sep 2021' 
        },
        { 
          value: 'gpt-4-32k', label: 'gpt-4-32k', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '32,768', data: 'Sep 2021' 
        },
        { 
          value: 'gpt-4-0613', label: 'gpt-4-0613', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '8,192', data: 'Sep 2021' 
        },
        { 
          value: 'gpt-4-32k-0613', label: 'gpt-4-32k-0613', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '32,768', data: 'Sep 2021' 
        },
        { 
          value: 'gpt-4-0314', label: 'gpt-4-0314', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '8,192', data: 'Sep 2021' 
        },
        { 
          value: 'gpt-4-32k-0314', label: 'gpt-4-32k-0314', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '32,768', data: 'Sep 2021' 
        },
        { 
          value: 'gpt-3.5-turbo-1106', label: 'gpt-3.5-turbo-1106', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '16,385', data: 'Sep 2021' 
        },
        { 
          value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '4,096', 
          data: 'Sep 2021' 
        },
        { 
          value: 'gpt-3.5-turbo-16k', label: 'gpt-3.5-turbo-16k', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '16,385', data: 'Sep 2021' 
        },
        { 
          value: 'gpt-3.5-turbo-instruct', label: 'gpt-3.5-turbo-instruct', 
          // provider: "OpenAI",
          modelType: "Proprietary",
          url: "https://api.openai.com/v1/chat/completions", 
          tokens: '4,096', data: 'Sep 2021' 
        },
  ];

    const nvidiaPlaygroundModelOptions = [
        // NVIDIA Playground Models... 
        { 
          value: 'Yi-34B', label: 'Yi-34B', 
          // provider: "NVIDIA Playground",
          modelType: "Community",
          url: "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/347fa3f3-d675-432c-b844-669ef8ee53df", 
          tokens: '4,096', data: 'Sep 2021' 
        },
  ];

    const [provider, setProvider] = useState('');
    const [url, setUrl] = useState('');

    let modelOptions = provider === "OpenAI" ? openAIModelOptions : provider === "NVIDIA AI Playground" ? nvidiaPlaygroundModelOptions : [];

    const [modelName, setModelName] = useState('');
    const [maxTokens, setMaxTokens] = useState('');
    const [trainingDataDate, setTrainingDataDate] = useState('');

    function handleProviderChange(selectedOption: any) {
        setProvider(selectedOption.value);
    }

    function handleModelChange(selectedOption: any) {
        setModelName(selectedOption.label);
        setMaxTokens(selectedOption.tokens);
        // setProvider(selectedOption.provider);
        setTrainingDataDate(selectedOption.data);
        setUrl(selectedOption.url);
    }

    function renderStatusMessage() {
        if (provider == '') {
            return <p><b>Provider Not Selected ...</b></p>

        } else if (API_KEY == '') {
            return <p><b>API Key Not Set ...</b></p>

        } else if (modelName == '') {
            return <p><b>Model Not Selected ...</b></p>


        } else if (isGenerating) {
            return <p><b>Generating response ...</b></p>

        } else if (!isGenerating && elapsedTime > 0) {
            const elapsedTimeInSeconds = (elapsedTime / 1000).toFixed(2);
            const tokensPerSecond = (tokenCount / (elapsedTime / 1000)).toFixed(2);
            return (
                <>
                    <p><b>Response Complete...</b></p>
                    <p>   {tokenCount} tokens generated in {elapsedTimeInSeconds}s </p> 
                    <p>   {tokensPerSecond} tokens per second. </p>
                </>
            )
        }
        return null;
    }

    const generate = async (input: string, provider: string) => {
        /*
        if (!input) {
            alert("Please enter a user prompt.");
            return;
        }
        */

        setResult("...");
        const startTime = Date.now();

        controllerRef.current = new AbortController();

        if (provider == "OpenAI" ||provider == "NVIDIA AI Playground") {
            setIsGenerating(true);
            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: [{ role: "user", content: input }],
                        // max_tokens: 1024,
                        stream: true,
                    }),
                    signal: controllerRef.current.signal,
                });
                
                if (!response.body) {
                    console.error("Response body is undefined.");
                    return
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let contentResult = "";

                var counter = 0;
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");
                    const parsedLines = lines
                        .map(line => line.replace(/^data: /, "").trim())
                        .filter(line => line !== "" && line !== "[DONE]")
                        .map(line => JSON.parse(line));

                    for (const parsedLine of parsedLines) {
                        const { choices } = parsedLine;
                        const { delta } = choices[0];
                        if (delta.content) {
                            contentResult += delta.content;
                            counter += 1
                        }
                    }

                    setResult(contentResult);
                    setTokenCount(counter)
                }
            } catch (error) {
                if (controllerRef.current.signal.aborted) {
                    setResult("Request aborted.");
                } else {
                    console.error("Error:", error);
                    setResult("Error occurred while generating.");
                }
            } finally {
                setIsGenerating(false);
            }

        }

        const endTime = Date.now();
        const elapsed = endTime - startTime;
        setElapsedTime(elapsed)
    };

    const stop = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
    };

    return (

        <div className='fullLLMContainer'>

            <div className="selectModelProvider">
                <span>Provider:&nbsp;</span>
                <Select options={providers} onChange={handleProviderChange} placeholder={"select provider"} />
            </div>

            <div className="apiKey">
                API Key:&nbsp;&nbsp;&nbsp;
                <input
                    type="text"
                    value={API_KEY}
                    onChange={(e) => setAPI_KEY(e.target.value)}
                    className="apiKeyInput"
                    placeholder="Enter API Key..."
                />
            </div>

            <div className="selectModel">
                <span>Model:&nbsp;</span>
                {}
                <Select options={modelOptions} onChange={handleModelChange} placeholder={"select model"} />
            </div>

            {modelName && (
                <table className='modelSpecs'>
                    {/*
                <thead>
                    <tr>
                    <th>Attribute</th>
                    <th>Value</th>
                    </tr>
                </thead>
                    */}
                <tbody>
                    <tr>
                        <td>Max Tokens</td>
                        <td>{maxTokens}</td>
                    </tr>
                    <tr>
                        <td>Training Data Date</td>
                        <td>{trainingDataDate}</td>
                    </tr>
                    <tr>
                        <td>URL</td>
                        <td>{url}</td>
                    </tr>
                </tbody>
                </table>
            )}

            <div className="textCompletionContainer">
                {debugFlag && (
                    <>
                        <h2>DEBUG</h2>
                            <p><i>provider:</i> {provider}</p>
                            <p><i>compbined prompt:</i> "{combinedPrompt}"</p>
                        <hr className="separator" />
                    </>
                )}
                <div>
                    <>
                        {renderStatusMessage()}
                        <hr className="separator" />
                    </>
                    <div >
                        <div id="resultContainer">
                            <ReactMarkdown
                                className="whitespace-pre-line markdown-table"
                                components={{
                                    code({node, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return match ? (
                                                // @ts-ignore
                                                <SyntaxHighlighter style={dark} language={match[1]} PreTag="div" {...props}>
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            )
                                    }
                                }}
                            >
                            {result}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default StreamingCompletions;