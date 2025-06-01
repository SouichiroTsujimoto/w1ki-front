import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Header.css';

function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/view/${searchQuery.trim()}`);
            setSearchQuery('');
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-title">
                    <Link style={{color: "black"}} to="/">記事一覧</Link>

                </div>
                <div className="search-container">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="ページを検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit">検索</button>
                    </form>
                </div>
            </div>
        </header>
    );
}

export default Header;
