import React, { useState } from 'react';
import './App.css';


const { GoogleGenerativeAI } = require("@google/generative-ai");


const SelectInput = ({ label, id, value, setValue, options }) => {
  return (
    <div className="input-row">
      <label htmlFor={id} className="input-label">{label}</label> 
      <select id={id} value={value} onChange={(e) => setValue(e.target.value)}>
        {options.map((option) => ( 
          <option key={option} value={option}>{option}</option> 
        ))}
      </select>
    </div>
  );
};


function renderMovieRecommendations(movies) {
  const recommendationsContainer = document.querySelector('.recommendations-section');
  recommendationsContainer.innerHTML = ''; // Clear previous results


  const message = document.createElement('p');
  message.textContent = "Here is a list of movies based on the description you gave:";
  recommendationsContainer.appendChild(message); 


  if (movies.length === 0) {
    recommendationsContainer.textContent = 'No movies found. Please refine your search.';
    return;
  }

  const list = document.createElement('ul');
  movies.forEach(movie => {
    const listItem = document.createElement('li');
    console.log(movie); 


    // Extract Movie Title and Description
    const titleStart = movie.indexOf(': ') + 2; // Find first ': ' and skip two characters
    const titleEnd = movie.indexOf('Desc:'); // Find the start of 'Desc:'

    if (titleEnd === -1) {
        // 'Desc:' not found, handle this case (return an error or default)
        return null; 
    }

    const movieTitle =  movie.substring(titleStart, titleEnd);

    const [movieTag, ...movieParts] = movie.split(': '); // Split ONLY on the first ': '
    const movieJunk = movieParts.shift(); // Remove the movie title from movieParts 


    const description = movieParts.join(': '); // Reassemble description (handles colons)

    // Bold and Italic Title
    const titleSpan = document.createElement('span');
    titleSpan.style.fontWeight = 'bold';
    titleSpan.style.fontStyle = 'italic';
    titleSpan.textContent = movieTitle; 

    // IMDB Link
    const imdbLink = document.createElement('a');
    imdbLink.href = `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}`; 
    imdbLink.textContent = ' (IMDB)'; 
    imdbLink.target = '_blank'; 

    // Assemble the list item
    listItem.appendChild(titleSpan); 
    listItem.appendChild(document.createTextNode(' - ')); // Text node separator
    listItem.appendChild(document.createTextNode(description));
    listItem.appendChild(imdbLink);
    list.appendChild(listItem);
  });
  recommendationsContainer.appendChild(list);
}




function App() {
  const [language, setLanguage] = useState('English'); 
  const [decade, setDecade] = useState('1990s');
  const [genre, setGenre] = useState('Thriller'); 
  const [description, setDescription] = useState('');

  // Function to handle form submission (you'll integrate ChatGPT API here)
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Initialize OpenAI API client
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY); 


    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro"});



    try {
      const prompt = `Create a list of movies based on this description or based on the mood this description implies: ${description}. Consider the language ${language}, movies from the decade ${decade}, and the genre ${genre}. (Important: It's a must that you should start each of the movie names with the word "Mov:" and each of the description with the word "Desc:" while keeping both of these as one single string in ONE SINGLE LINE(DEALBREAKER) DO NOT SPLIT THEM UP AS TWO LINES, add the release year after the movie name with a parantheses. also don't make the text bold)`;

      const result = await model.generateContent(prompt);
      
      const response = await result.response;
      const generatedMovieTitles = response.text();  

      console.log(generatedMovieTitles); 
    
      // Update recommendations section directly
      renderMovieRecommendations(generatedMovieTitles.split('\n')); // Assuming titles are separated by newlines 
    
    } 
    catch (error) {
      console.error("Gemini Error:", error); 
    }
  }

  return (
    <div id="app-container">
      <h2>Filmey - Get Movie Suggestions</h2> 
      <div className="recommendations-section">
        {/* Movie recommendation display will go here */}
      </div>
      <div className="input-section">
        <form onSubmit={handleSubmit}> 
          <SelectInput
            label="Preferred Language:"
            id="language"
            value={language}
            setValue={setLanguage}
            options={['Any', 'English', 'Hindi', 'French', 'Spanish', 'Japanese', 'Telugu', 'Malayalam', 'Tamil', 'Korean']}
          />
          <SelectInput
            label="Release Decade:"
            id="decade"
            value={decade}
            setValue={setDecade}
            options={['Any', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']}
          />
          <SelectInput
            label="Preferred Genre:"
            id="genre"
            value={genre}
            setValue={setGenre}
            options={['Any', 'Action', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western']}
          />
          <div className="description-row">
            <label htmlFor="description">A brief prompt for the kinda movie you wanna watch or describing your current mood:</label>
            <textarea 
                id="description" 
                placeholder="Examples: A movie in which the Earth is no longer habitable, I feel like a detective." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <button id="search-button">Try me!</button> 
        </form>
      </div>
      
    </div>
  );
}

export default App;
