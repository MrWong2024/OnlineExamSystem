// src/app/editor/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { editor } from 'monaco-editor';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import hljs from 'highlight.js';

interface Question {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  acceptanceRate: number;
  tags: string[];
  examples: string;
  solution: string;
}

// 定义模型类型
interface AIModel {
  value: string;
  displayText: string;
}

const buttonStyle: React.CSSProperties = {
  marginRight: '10px',
  backgroundColor: '#10a37f',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer'
};

const CodeEditorPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [editorFontSize, setEditorFontSize] = useState<number>(14);
  const [checkResults, setCheckResults] = useState<string>('');
  const [improvedCode, setImprovedCode] = useState<string>('');
  const [bestPractice, setBestPractice] = useState<string>('');
  const [showQuestionList, setShowQuestionList] = useState<boolean>(false); // 添加状态控制题目列表面板
  const [selectedAIModel, setSelectedAIModel] = useState<string>(''); // 默认选中模型的状态
  const [modelList, setModelList] = useState<AIModel[]>([]); // AI 模型列表
  const [isAICheckButtonDisabled, setIsAICheckButtonDisabled] = useState(false);
  const [isCompileButtonDisabled, setIsCompileButtonDisabled] = useState(false);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // 获取题目列表
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          }
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const response = await res.json();
        setQuestions(response.data || []);
        if ((response.data || []).length > 0) {
          setCurrentQuestionIndex(0);
          setCode('');
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  // 获取AI模型列表
  useEffect(() => {
    async function fetchAiModels() {
      try {
        const res = await fetch('/api/ai-models'); // 通过API获取模型列表
        if (!res.ok) throw new Error('Failed to fetch AI model list');
        const data = await res.json();
        setModelList(data);
        if (data.length > 0) {
          setSelectedAIModel(data[0].value); // 默认选中第一个模型
        }
      } catch (error) {
        console.error('加载AI模型列表失败:', error);
      }
    }
    fetchAiModels();
  }, []);
  
  // 更新当前题目
  useEffect(() => {
    if (questions.length > 0) {
      setCode('');
      setOutput('');
      setCheckResults('');
      setImprovedCode('');
      setBestPractice('');
    }
  }, [currentQuestionIndex, questions]);

  const handleCompile = async () => {
    setIsCompileButtonDisabled(true); // 禁用按钮
    try {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Compilation failed');
      }
      const data = await res.json();
      setOutput(data.output);
    } catch (error) {
      console.error('Compilation error:', error);
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setIsCompileButtonDisabled(false); // 恢复按钮
    }
  };

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current?.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleZoomIn = () => setEditorFontSize((size) => size + 1);
  const handleZoomOut = () => setEditorFontSize((size) => Math.max(size - 1, 8));
  const handleResetLayout = () => {
    setEditorFontSize(14);
    // 如果需要重置分栏位置，可通过给 PanelGroup 设置 key 来重建组件
  };

  const handleAICheck = async () => {
    setIsAICheckButtonDisabled(true); // 禁用按钮
    try {
      const res = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, model: selectedAIModel })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'AI 检查失败');
      }
      const data = await res.json();
      setCheckResults(data.checkResults);
      setImprovedCode(data.improvedCode);
      setBestPractice(data.bestPractice || ''); 
    } catch (error) {
      console.error('AI Check error:', error);
      setCheckResults(`Error: ${(error as Error).message}`);
      setImprovedCode('');
      setBestPractice('');
    } finally {
      setIsAICheckButtonDisabled(false); // 恢复按钮
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <PanelGroup direction="horizontal" style={{ height: '100vh', width: '100vw' }}>
      {/* 左侧栏：题目列表和导航按钮 */}
      <Panel defaultSize={25} minSize={20}>
        <div style={{ padding: '10px', height: '100%', boxSizing: 'border-box', overflowY: 'auto', backgroundColor: '#f9f9f9', position: 'relative' }}>
          {/* 可点击的题目列表标题 */}
          <h2 
            onClick={() => setShowQuestionList(!showQuestionList)} 
            style={{ cursor: 'pointer', userSelect: 'none', position: 'relative' }}
          >
            题目列表 {showQuestionList ? '▲' : '▼'}
          </h2>

          {/* 题目列表面板，默认隐藏，并以绝对定位显示在详细信息上方 */}
          {showQuestionList && (
            <div 
              style={{ 
                position: 'absolute', 
                top: '40px', 
                left: '0', 
                width: '100%', // 修改为宽度100%，移除 right: '0'
                backgroundColor: '#f9f9f9', 
                zIndex: 1000, 
                maxHeight: '80vh', 
                overflowY: 'auto', 
                padding: '10px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {questions.map((question, index) => (
                  <li 
                    key={question._id} 
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setShowQuestionList(false); // 选择题目后隐藏列表
                    }} 
                    style={{ 
                      padding: '8px', 
                      margin: '4px 0', 
                      cursor: 'pointer', 
                      backgroundColor: index === currentQuestionIndex ? '#e0f7fa' : '#f9f9f9',
                      borderRadius: '4px'
                    }}
                  >
                    {index + 1}. {question.title} ({question.difficulty})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 当前题目的详细信息 */}
          {questions.length > 0 && (
            <div style={{ marginTop: showQuestionList ? '0' : '20px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
              <h3>{questions[currentQuestionIndex].title}</h3>
              <p><strong>分类:</strong> {questions[currentQuestionIndex].category}</p>
              <p><strong>难度:</strong> {questions[currentQuestionIndex].difficulty}</p>
              <p><strong>接受率:</strong> {questions[currentQuestionIndex].acceptanceRate}%</p>
              <p><strong>标签:</strong> {questions[currentQuestionIndex].tags.join(', ')}</p>
              <div>
                <strong>描述:</strong>
                <p>{questions[currentQuestionIndex].description}</p>
              </div>
              <div>
                <strong>示例:</strong>
                <pre style={{ backgroundColor: '#f0f0f0', padding: '8px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                  {questions[currentQuestionIndex].examples.replace(/\\n/g, '\n')}
                </pre>
              </div>
            </div>
          )}

          {/* 导航按钮 */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <button 
              onClick={handlePrevQuestion} 
              disabled={currentQuestionIndex === 0}
              style={buttonStyle}
            >
              上一题
            </button>
            <button 
              onClick={handleNextQuestion} 
              disabled={currentQuestionIndex === questions.length - 1}
              style={buttonStyle}
            >
              下一题
            </button>
          </div>
        </div>
      </Panel>

      {/* 分隔条 */}
      <PanelResizeHandle style={{ width: '5px', cursor: 'col-resize', backgroundColor: '#ddd' }} />

      {/* 主区域 */}
      <Panel defaultSize={75}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 顶部工具栏 */}
          <div style={{ display: 'flex', backgroundColor: '#f5f5f5', padding: '10px', alignItems: 'center' }}>
            <button 
              onClick={handleCompile}
              disabled={isCompileButtonDisabled}
              style={buttonStyle}
            >
              编译并运行
            </button>
            <button 
              onClick={handleFormatCode}
              style={buttonStyle}
            >
              代码格式化
            </button>
            <button 
              onClick={handleZoomIn}
              style={buttonStyle}
            >
              放大
            </button>
            <button 
              onClick={handleZoomOut}
              style={buttonStyle}
            >
              缩小
            </button>
            <button 
              onClick={handleResetLayout}
              style={buttonStyle}
            >
              恢复默认布局
            </button>
            {/* 新增AI检查按钮 */}
            <button
              onClick={handleAICheck}
              disabled={isAICheckButtonDisabled}
              style={buttonStyle}
            >
              AI检查
            </button>
            {/* 动态加载AI模型列表，并默认选中第一个 */}
            <select 
              value={selectedAIModel} 
              onChange={(e) => setSelectedAIModel(e.target.value)} 
              style={{ marginLeft: '10px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {modelList.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.displayText}
                </option>
              ))}
            </select>
            {/* 字体大小调整 */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <label htmlFor="fontSize" style={{ marginRight: '8px' }}>字体大小:</label>
              <input 
                type="number" 
                id="fontSize"
                value={editorFontSize} 
                onChange={(e) => setEditorFontSize(Number(e.target.value))}
                min={8}
                max={30}
                style={{ width: '60px', padding: '4px' }}
              />
            </div>
          </div>
          
          {/* 垂直分栏：编辑器+检查结果 和 运行结果 */}
          <PanelGroup direction="vertical" style={{ flex: 1 }}>
            <Panel defaultSize={70}> 
              {/* 上半部分继续水平分栏：左侧编辑器，右侧检查结果和改进代码 */}
              <PanelGroup direction="horizontal" style={{ height: '100%' }}>
                <Panel defaultSize={50}>
                  <Editor
                    height="100%"
                    language="cpp"
                    value={code}
                    onChange={(value) => setCode(value ?? '')}
                    onMount={handleEditorMount}
                    options={{
                      fontSize: editorFontSize,
                    }}
                  />
                </Panel>
                <PanelResizeHandle style={{ width: '5px', background: '#ccc', cursor: 'col-resize' }} />
                <Panel defaultSize={50}>
                  <div style={{ padding: '10px', height: '100%', boxSizing: 'border-box', overflow: 'auto', fontSize: '14px' }}>
                    <h3>检查结果和改进代码</h3>
                    <div><strong>检查结果:</strong></div>
                    <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px', backgroundColor: '#fff3e0', padding: '8px', borderRadius: '4px' }}>{checkResults}</div>
                    <div><strong>改进代码:</strong></div>
                    <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', marginBottom: '10px'}}>{improvedCode}</pre>
                    <div><strong>最佳实践:</strong></div>
                    {/* <SyntaxHighlighter language="cpp" style={atomOneLight}>
                      {bestPractice}
                    </SyntaxHighlighter> */}
                    {(() => {
                      // 自动检测最佳实践文本的语言
                      const detected = hljs.highlightAuto(bestPractice);
                      const lang = detected.language || 'plaintext';

                      return (
                        <SyntaxHighlighter language={lang} style={atomOneLight}>
                          {bestPractice}
                        </SyntaxHighlighter>
                      );
                    })()}
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle style={{ height: '5px', background: '#ccc', cursor: 'row-resize' }} />
            
            <Panel defaultSize={30}>
              <div style={{ padding: '10px', height: '100%', boxSizing: 'border-box', overflow: 'auto', backgroundColor: '#f9f9f9' }}>
                <h3>运行结果窗口</h3>
                <div><strong>输出:</strong></div>
                <pre style={{ backgroundColor: '#fff3e0', padding: '8px', borderRadius: '4px' }}>{output}</pre>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default CodeEditorPage;
