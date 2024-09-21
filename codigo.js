const apiUrl = 'https://pokeapi.co/api/v2/pokemon';
const typeApiUrl = 'https://pokeapi.co/api/v2/type';
const paginatedLimit = 20; // Limite de resultados por página
let nextUrl = '';
let prevUrl = '';
let currentType = '';
let searchQuery = '';
let isNameSearch = false;
let currentOffset = 0; 

const fetchPokemons = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        nextUrl = data.next; 
        prevUrl = data.previous; 
        displayPokemons(data.results);
        togglePaginationButtons();
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
    }
};

const displayPokemons = async (pokemons) => {
    const pokedex = document.getElementById('pokedex');
    pokedex.innerHTML = '';  

    for (const pokemon of pokemons) {
        const pokeData = await fetch(pokemon.url);
        const pokeDetails = await pokeData.json();
        createPokemonCard(pokeDetails);
    }
};

const createPokemonCard = (pokemon) => {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    const pokemonTypes = pokemon.types.map(type => translateType(type.type.name)).join(', ');

    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="animate__animated">
        <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
        <p>Tipos: ${pokemonTypes}</p>
    `;

    const pokedex = document.getElementById('pokedex');
    pokedex.appendChild(card);
};

const translateType = (type) => {
    const types = {
        normal: 'Normal',
        fighting: 'Lucha',
        flying: 'Volador',
        poison: 'Veneno',
        ground: 'Tierra',
        rock: 'Roca',
        bug: 'Bicho',
        ghost: 'Fantasma',
        steel: 'Acero',
        fire: 'Fuego',
        water: 'Agua',
        grass: 'Planta',
        electric: 'Eléctrico',
        psychic: 'Psíquico',
        ice: 'Hielo',
        dragon: 'Dragón',
        dark: 'Siniestro',
        fairy: 'Hada'
    };
    return types[type] || type;
};

const searchPokemons = async () => {
    const searchValue = document.getElementById('search').value.toLowerCase();
    const typeFilter = document.getElementById('type-filter').value;

    if (searchValue) {
        if (!isNaN(searchValue)) {
            fetchPokemonById(searchValue); 
        } else {
            searchQuery = searchValue;
            isNameSearch = true;
            currentOffset = 0; 
            fetchPokemonByNamePartial(searchQuery);
        }
    } else if (typeFilter) {
        currentType = typeFilter;
        isNameSearch = false;
        currentOffset = 0; 
        fetchPokemonByType(currentType);
    } else {
        currentOffset = 0; 
        fetchPokemons(`${apiUrl}?limit=${paginatedLimit}`);
    }
};

const fetchPokemonById = async (id) => {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Pokémon no encontrado');
        const pokeDetails = await response.json();
        displayPokemons([pokeDetails]);
        nextUrl = null;
        prevUrl = null; 
        togglePaginationButtons();
    } catch (error) {
        console.error('Error fetching Pokémon by ID:', error);
    }
};


const fetchPokemonByNamePartial = async (query) => {
    try {
        const response = await fetch(`${apiUrl}?limit=1000`);
        const data = await response.json();
        const filteredPokemons = data.results.filter(pokemon => pokemon.name.includes(query));
        
        const paginatedPokemons = filteredPokemons.slice(currentOffset, currentOffset + paginatedLimit);
        nextUrl = filteredPokemons.length > currentOffset + paginatedLimit ? 'name-next' : null;
        prevUrl = currentOffset > 0 ? 'name-prev' : null; 

        displayPokemons(paginatedPokemons);
        togglePaginationButtons();
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
    }
};

const fetchPokemonByType = async (type) => {
    try {
        const response = await fetch(`${typeApiUrl}/${type}`);
        const data = await response.json();
        const pokemons = data.pokemon.map(p => p.pokemon);

        displayPokemons(pokemons);
        nextUrl = null; 
        prevUrl = null; 
        togglePaginationButtons();
    } catch (error) {
        console.error('Error fetching Pokémon by type:', error);
    }
};

const togglePaginationButtons = () => {
    document.getElementById('prev-btn').disabled = !prevUrl;
    document.getElementById('next-btn').disabled = !nextUrl;
};

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const handleNextPage = () => {
    currentOffset += paginatedLimit; 
    if (isNameSearch) {
        fetchPokemonByNamePartial(searchQuery);
    } else if (currentType) {
        fetchPokemonByType(currentType);
    } else {
        fetchPokemons(nextUrl);
    }
};

const handlePrevPage = () => {
    currentOffset -= paginatedLimit; 
    if (isNameSearch) {
        fetchPokemonByNamePartial(searchQuery);
    } else if (currentType) {
        fetchPokemonByType(currentType);
    } else {
        fetchPokemons(prevUrl);
    }
};

document.getElementById('search').addEventListener('input', searchPokemons);
document.getElementById('type-filter').addEventListener('change', searchPokemons);
document.getElementById('next-btn').addEventListener('click', handleNextPage);
document.getElementById('prev-btn').addEventListener('click', handlePrevPage);

fetchPokemons(`${apiUrl}?limit=${paginatedLimit}`);
