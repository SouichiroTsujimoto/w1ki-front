import React from 'react'
import { useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import './PageView.css'
import './editorStyles.css'

function PageView()  {
    const urlParams = useParams<{ title: string }>()
    const [markdown, setMarkdown] = useState<string>("");
    const [editorMode, setEditorMode] = useState<boolean>(false);
    // const [textValue, setTextValue] = useState<string>('');
    const socketRef = useRef<WebSocket | null>(null);

    React.useEffect(() => {
        handleLoad(urlParams.title || "");
    }, [urlParams.title])

    React.useEffect(() => {
        const websocket = new WebSocket("ws://localhost:8080/ws");
        socketRef.current = websocket;

        const onMessage = (event: MessageEvent<string>) => {
            setMarkdown(event.data)
        }
        websocket.addEventListener('message', onMessage);

        return () => {
            websocket.close()
            websocket.removeEventListener('message', onMessage);
        }
    }, [markdown])

    const reloadRoot = useCallback(() => {
        window.location.href = "/";
    }, []);

    const reloadPage = useCallback(() => {
        window.location.reload();
    }, []);

    function handleSubmit(title: string, markdown: string) {
        const post = { title, markdown };
        axios.post("http://localhost:8080/page/" + title, post)
            .then(response => {
                console.log('記事保存:', response.data);
            })
            .catch(error => {
                console.error('記事保存エラー:', error);
            });
    };

    function handleLoad(title: string) {
        if(title !== "") {
            axios.get("http://localhost:8080/page/" + title)
                .then(response => {
                    console.log('記事読み込み:', response.data);
                    if(response.data) {
                        setMarkdown(response.data);
                    } else {
                        setMarkdown("## " + title + "\n---");
                    }
                })
                .catch(error => {
                    console.error('記事読み込みエラー:', error);
                })
        }
    }

    function handleDelete() {
        if(confirm("ページを削除しますか？")) {
            axios.delete("http://localhost:8080/page/" + urlParams.title)
                .then(response => {
                    console.log('記事削除:', response.data);
                    reloadRoot();
                })
                .catch(error => {
                    console.error('記事削除エラー:', error);
                })
        }
    }

    function editorView() {
       return  (
           <div className="editor-container">
               <div className="preview">
                   <Markdown remarkPlugins={[remarkGfm]}>
                       {markdown}
                   </Markdown>
               </div>
               <textarea
                   className="editor"
                   value={markdown}
                   onChange={(e) => {
                       const newValue = e.target.value;
                       setMarkdown(newValue);
                       socketRef.current?.send(newValue);
                       console.log(newValue);
                   }}
                   placeholder="Enter text here"
               />
           </div>
       )
    }

    function articleView() {
        return (
            <>
                <div className="article">
                    <Markdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                    </Markdown>
                </div>
            </>
        )
    }


    return (
        <div className="page-view-container">
            {/*<h1 id="title">{urlParams.title}</h1>*/}
            <div id="editPage">
                <div className="action-buttons">
                    {/*<button className="action-button" onClick={() => handleLoad(urlParams.title || "")}>読み込み</button>*/}
                    <button
                        className="action-button"
                        id="modeSwith"
                        onClick={() => {
                            if(editorMode) {
                                handleSubmit(urlParams.title|| "", markdown)
                                reloadPage();
                            }
                            setEditorMode(!editorMode)
                        }}
                    >
                        {editorMode ? '編集完了' : '編集'}
                    </button>
                    {editorMode ?
                        <>
                        <button
                            className="action-button"
                            id="cancelEdit"
                            onClick={() => {
                                handleLoad(urlParams.title || "")
                                setEditorMode(false)
                            }}
                        >
                            編集をキャンセル
                        </button>
                        <button
                            className="action-button"
                            id="deleteButton"
                            onClick={() => {
                                handleDelete()
                            }}
                        >
                            ページを削除
                        </button>
                        </>
                        : <></>
                    }
                </div>

                {editorMode ? editorView() : articleView()}
            </div>
        </div>
    )

}

export default PageView
