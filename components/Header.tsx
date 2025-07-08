import React, { useState } from 'react';
import Icon from './Icon';

interface HeaderProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');

    const handleSearchClick = () => {
        onSearch(query);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearch(query);
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-brand-primary">Radiology Inventory System</h1>
                    </div>
                    <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
                        <div className="max-w-lg w-full lg:max-w-md">
                            <label htmlFor="search" className="sr-only">Search</label>
                            <div className="relative flex items-center">
                                <input
                                    id="search"
                                    className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                    placeholder='AI Search: "active MRI scanners"'
                                    type="search"
                                    name="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                />
                                <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                                    <button
                                        type="button"
                                        onClick={handleSearchClick}
                                        disabled={isLoading}
                                        className="inline-flex items-center rounded border border-gray-200 bg-white px-2.5 font-sans text-xs text-gray-400 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    >
                                        {isLoading ? (
                                            <Icon name="spinner" className="h-5 w-5 text-brand-primary" />
                                        ) : (
                                            <Icon name="search" className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;