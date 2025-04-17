import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SnakeGame from './components/SnakeGame';
import CatapultGame from './components/CatapultGame';
import './App.css';

const App: React.FC = () => {
  const games = [
    {
      id: 'snake',
      title: 'Snake',
      description: 'Classic snake game with modern graphics',
      thumbnail: 'https://placehold.co/300x200/4a5568/ffffff?text=Snake',
      path: '/snake'
    },
    {
      id: 'catapult',
      title: 'Catapult Challenge',
      description: 'Launch projectiles and hit the target!',
      thumbnail: 'https://placehold.co/300x200/4a5568/ffffff?text=Catapult',
      path: '/catapult'
    }
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Game Portal
              </Link>
              <nav className="flex space-x-4">
                <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link to="/snake" className="text-gray-600 hover:text-gray-900">Snake</Link>
                <Link to="/catapult" className="text-gray-600 hover:text-gray-900">Catapult</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Home Page */}
            <Route path="/" element={
              <div className="space-y-8">
                {/* Hero Section */}
                <section className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to Game Portal
                  </h1>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Play amazing games right in your browser. No downloads required!
                  </p>
                </section>

                {/* Featured Games */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Games</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game) => (
                      <Link
                        key={game.id}
                        to={game.path}
                        className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="relative aspect-video">
                          <img
                            src={game.thumbnail}
                            alt={game.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {game.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {game.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Categories */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Action', 'Puzzle', 'Arcade', 'Strategy'].map((category) => (
                      <div
                        key={category}
                        className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow duration-200 cursor-pointer"
                      >
                        <span className="text-gray-900 font-medium">{category}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            } />

            {/* Game Routes */}
            <Route path="/snake" element={<SnakeGame />} />
            <Route path="/catapult" element={<CatapultGame />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>© 2024 Game Portal. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App; 