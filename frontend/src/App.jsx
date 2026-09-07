import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <h1 className="logo">Movie Recommendation System</h1>

        <nav>
          <a href="#">Home</a>
          <a href="#">Browse</a>
          <a href="#">My List</a>
          <button className="login-button">Login</button>
        </nav>
      </header>

      <main className="hero">
        <div className="hero-content">
          <p className="tagline">NEURAL NETWORK POWERED RECOMMENDATIONS</p>

          <h2>Discover movies made for you.</h2>

          <p className="description">
            Browse movies, save your favourites and receive personalized
            recommendations based on your interests.
          </p>

          <div className="hero-buttons">
            <button className="primary-button">Explore Movies</button>
            <button className="secondary-button">Learn More</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;