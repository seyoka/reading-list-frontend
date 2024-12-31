'use client';

import { useState } from 'react';
import axios from 'axios';

export default function AddBook() {
    const [title, setTitle] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number | ''>('');

    const addBook = async () => {
        if (title && author && totalPages !== '') {
            console.log(`Adding book: Title - ${title}, Author - ${author}, Total Pages - ${totalPages}`);
            try {
                await axios.post(
                    'http://localhost:8080/api/books',
                    { title, author, totalPages: Number(totalPages), pagesRead: 0 },
                    { headers: { 'Content-Type': 'application/json' } }
                );
                console.log("Book added successfully!");
                setTitle('');
                setAuthor('');
                setTotalPages('');
                alert('Book added!');
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    console.error("Error adding book:", error.response?.data || error.message);
                } else {
                    console.error("Unexpected error:", error);
                }
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Add a New Book</h1>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    className="p-2 border rounded w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Author"
                    className="p-2 border rounded w-full"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Total Pages"
                    className="p-2 border rounded w-full"
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                />
                <button
                    className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full ${
                        (!title || !author || totalPages === '') && 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={addBook}
                    disabled={!title || !author || totalPages === ''}
                >
                    Add Book
                </button>
            </div>
        </div>
    );
}
