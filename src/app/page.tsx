'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Book } from './types';

export default function Home() {
    const [currentlyReading, setCurrentlyReading] = useState<Book | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [pagesRead, setPagesRead] = useState<number | ''>('');
    const [newBook, setNewBook] = useState({ title: '', author: '', totalPages: 0 });
    const [completedBooks, setCompletedBooks] = useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState<Book[]>(books);
   


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [currentlyReadingResponse, bookListResponse, completedBooksResponse] = await Promise.all([
                    axios.get<Book>('http://localhost:8080/api/books/currently-reading'),
                    axios.get<Book[]>('http://localhost:8080/api/books/book-list'),
                    axios.get<Book[]>('http://localhost:8080/api/books/completed'),
                ]);
    
                // Set data to states
                setCurrentlyReading(currentlyReadingResponse.data || null);
                setBooks(bookListResponse.data);
                setCompletedBooks(completedBooksResponse.data);
    
                // Initialize filteredBooks with all books
                setFilteredBooks(bookListResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, []);
    

    const updateProgress = async () => {
        if (currentlyReading && pagesRead !== '') {
            const newPageCount = currentlyReading.pagesRead + Number(pagesRead);

            if (newPageCount > currentlyReading.totalPages) {
                alert(`You cannot exceed the total page count of ${currentlyReading.totalPages}.`);
                setPagesRead('');
                return;
            }
            if (Number(pagesRead) < 0) {
                alert('Pages read cannot be negative.');
                setPagesRead('');
                return;
            }

            await axios.put(`http://localhost:8080/api/books/${currentlyReading.id}`, {
                pagesRead: Number(pagesRead),
            });
            setPagesRead('');
            const updatedBook = await axios.get<Book>('http://localhost:8080/api/books/currently-reading');
            setCurrentlyReading(updatedBook.data);
        }
    };

    const addNewBook = async () => {
        if (newBook.title && newBook.author && newBook.totalPages > 0) {
            try {
                await axios.post('http://localhost:8080/api/books', newBook);
                setNewBook({ title: '', author: '', totalPages: 0 });
    
 
                const bookListResponse = await axios.get<Book[]>('http://localhost:8080/api/books/book-list');
                setBooks(bookListResponse.data);
    

                setFilteredBooks(bookListResponse.data);
            } catch (error) {
                console.error("Error adding new book:", error);
            }
        }
    };
    

    return (
        <div className="max-w-4xl mx-auto p-6 text-white bg-black min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-center border-b border-gray-700 pb-4">My Reading List</h1>
    
            {/* Currently Reading Section */}
            <div className="mb-12">
                <h2 className="text-3xl font-semibold mb-4">Currently Reading</h2>
                {currentlyReading ? (
                    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-semibold">{currentlyReading.title}</h3>
                        <p className="text-gray-400 mb-4">
                            by {currentlyReading.author} — {currentlyReading.pagesRead}/{currentlyReading.totalPages} pages read
                        </p>
                        <div className="mt-4">
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-600 rounded-full h-3">
                                <div
                                    className="bg-white h-3 rounded-full"
                                    style={{
                                        width: `${(currentlyReading.pagesRead / currentlyReading.totalPages) * 100}%`,
                                    }}
                                ></div>
                            </div>
                            <p className="text-gray-500 text-sm mt-2">
                                Progress: {Math.round((currentlyReading.pagesRead / currentlyReading.totalPages) * 100)}%
                            </p>
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                            <div className="flex items-center space-x-4 w-full sm:w-auto">
                                <input
                                    type="number"
                                    placeholder="Pages Read"
                                    className="p-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none w-full sm:w-auto"
                                    value={pagesRead}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value >= 0) setPagesRead(value); // Prevent negative input
                                    }}
                                />
                                <button
                                    className="bg-green-600 px-6 py-2 rounded-lg text-white hover:bg-green-700"
                                    onClick={updateProgress}
                                    disabled={pagesRead === ''}
                                >
                                    Update
                                </button>
                            </div>
                            <button
                                className="bg-blue-600 px-6 py-2 mt-4 sm:mt-0 rounded-lg text-white hover:bg-blue-700"
                                onClick={async () => {
                                    if (currentlyReading) {
                                        await axios.put(`http://localhost:8080/api/books/${currentlyReading.id}/mark-completed`);
                                        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== currentlyReading.id));
                                        setCurrentlyReading(null);
                                        const completedBooksResponse = await axios.get<Book[]>('http://localhost:8080/api/books/completed');
                                        setCompletedBooks(completedBooksResponse.data);
                                    }
                                }}
                            >
                                Mark as Completed
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No book is currently being read.</p>
                )}
            </div>
    
            {/* Book List Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Book List</h2>
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search books..."
                    className="p-2 border rounded w-full mb-4"
                    value={searchQuery}
                    onChange={(e) => {
                        const query = e.target.value.toLowerCase();
                        setSearchQuery(query);
                        if (query === '') {
                            setFilteredBooks(books); // Reset to all books
                        } else {
                            setFilteredBooks(
                                books.filter((book) =>
                                    book.title.toLowerCase().includes(query) ||
                                    book.author.toLowerCase().includes(query)
                                )
                            );
                        }
                    }}
                />
                <ul className="space-y-4">
                    {filteredBooks.map((book) => (
                        <li
                            key={book.id}
                            className="p-4 bg-gray-800 text-white rounded shadow flex justify-between items-center"
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{book.title}</h3>
                                <p className="text-gray-400">by {book.author}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={async () => {
                                    try {
                                        // Mark the book as currently reading
                                        await axios.put(`http://localhost:8080/api/books/${book.id}/mark-currently-reading`);

                                        // Fetch the updated book list and currently reading book
                                        const bookListResponse = await axios.get<Book[]>('http://localhost:8080/api/books/book-list');
                                        const currentlyReadingResponse = await axios.get<Book>('http://localhost:8080/api/books/currently-reading');

                                        // Update the state
                                        setBooks(bookListResponse.data);
                                        setFilteredBooks(bookListResponse.data); // Update the search filter list
                                        setCurrentlyReading(currentlyReadingResponse.data);
                                    } catch (error) {
                                        console.error("Error marking book as currently reading:", error);
                                    }
                                }}
                            >
                                Start Reading
                            </button>

                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    onClick={async () => {
                                        await axios.delete(`http://localhost:8080/api/books/${book.id}`);
                                        setBooks((prevBooks) => prevBooks.filter((b) => b.id !== book.id));
                                        setFilteredBooks((prevBooks) => prevBooks.filter((b) => b.id !== book.id));
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>


    
            {/* Add New Book Section */}
            <div className="mb-12">
                <h2 className="text-3xl font-semibold mb-4">Add a New Book</h2>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Title"
                        className="p-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none w-full"
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Author"
                        className="p-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none w-full"
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Total Pages"
                        className="p-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none w-full"
                        value={newBook.totalPages}
                        onChange={(e) => setNewBook({ ...newBook, totalPages: Number(e.target.value) })}
                    />
                    <button
                        className="bg-green-600 px-6 py-2 rounded-lg text-white hover:bg-green-700 w-full"
                        onClick={addNewBook}
                        disabled={!newBook.title || !newBook.author || newBook.totalPages <= 0}
                    >
                        Add Book
                    </button>
                </div>
            </div>
    
            {/* Completed Books Section */}
            <div>
                <h2 className="text-3xl font-semibold mb-4">Completed Books</h2>
                <ul className="space-y-4">
                    {completedBooks.map((book) => (
                        <li key={book.id} className="p-6 bg-gray-800 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-semibold">{book.title}</h3>
                            <p className="text-gray-400">
                                by {book.author} — {book.pagesRead}/{book.totalPages} pages read
                            </p>
                            {book.startDate && book.completionDate && (
                                <>
                                    <p className="text-gray-500 text-sm">
                                        Started on: {new Date(book.startDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        Completed on: {new Date(book.completionDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        Took {Math.ceil(
                                            (new Date(book.completionDate).getTime() - new Date(book.startDate).getTime()) /
                                            (1000 * 60 * 60 * 24)
                                        )}{" "}
                                        days to complete
                                    </p>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
}    