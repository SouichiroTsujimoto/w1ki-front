import React from 'react'
import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './NewPage.css'

function PageView()  {
    const urlParams = useParams<{ title: string }>()
    const navigate = useNavigate()
    const [title, setTitle] = useState<string>("");
    const [markdown, setMarkdown] = useState<string>("");
    // const [editorMode, setEditorMode] = useState<boolean>(false);
    // const [textValue, setTextValue] = useState<string>('');
    const socketRef = useRef<WebSocket | null>(null);

    React.useEffect(() => {
        setTitle(urlParams.title || "");
        handleLoad(urlParams.title || "");

    }, [urlParams.title])

    const createNewArticle = (title: string, markdown: string) => {
        const post = { title, markdown };
        axios.post(getApiUrl(`/page/${title}`), post)
            .then(response => {
                console.log('記事作成:', response.data);
                // 記事作成成功後、該当記事のページビューにリダイレクト
                navigate(`/view/${encodeURIComponent(title)}`);
            })
            .catch(error => {
                console.error('記事作成エラー:', error);
                alert("記事作成に失敗しました。");
            });
    }
    const handleSubmit = (title: string, markdown: string) => {
        if(title === "") {
            alert("タイトルを入力してください。");
            return;
        }
        axios.get(getApiUrl(`/page/${title}`))
            .then(response => {
                console.log('記事確認:', response.data);
                if(response.data == "" || confirm("既に同じタイトルの記事があります。上書きしますか？")) {
                    createNewArticle(title, markdown);
                    return;
                }
            })
            .catch(() => {
                createNewArticle(title, markdown);
            })
    };

    const handleLoad = (title: string) => {
        if(title !== "") {
            axios.get(getApiUrl(`/page/${title}`))
                .then(response => {
                    console.log('記事読み込み:', response.data);
                    setMarkdown(response.data);
                })
                .catch(error => {
                    console.error('記事読み込みエラー:', error);
                })
        }
    }

    function editorView() {
        return (
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
                    }}
                    placeholder="Enter text here"
                />
            </div>
        )
    }


    return (
        <div className="page-view-container">
            <div id="editPage">
                <h1>新規作成</h1>
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            // handleLoad(e.target.value);
                        }}
                        placeholder="タイトルを入力"
                        className="title-input"
                    />
                    <div className="action-buttons">
                        {/*<button className="action-button" onClick={() => handleLoad(urlParams.title || "")}>読み込み</button>*/}
                        <button
                            className="action-button"
                            id="createArticle"
                            onClick={() => {
                                handleSubmit(title, markdown)
                            }}
                        >
                            保存
                            {/*{editorMode ? '編集完了' : '編集'}*/}
                        </button>
                    </div>
                </div>
                { editorView() }
                {/*{editorMode ? editorView() : articleView()}*/}
            </div>
        </div>
    )

}

export default PageView
