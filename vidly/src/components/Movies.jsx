import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import MoviesTable from './common/MoviesTable';
import Pagination from './common/Pagination';
import ListGroup from './common/ListGroup';
import SearchBox from './common/SearchBox';
import { getMovies, deleteMovie } from '../services/movieService';
import { getGenres } from '../services/genreService';
import { paginate } from './utils/paginate';
import _ from 'lodash';

class Movies extends Component {
  state = {  
    movies: [],
    genres: [],
    pageSize: 4,
    currentPage: 1,
    sortColumn: { path: 'title', order: 'asc' },
    searchQuery: '',
    selectedGenre: ''
  }

  async componentDidMount() {
    const { data } = await getGenres();
    const genres = [{ _id: '', name: 'All Genres' }, ...data];

    const { data: movies } = await getMovies();
    this.setState({ genres, movies });
  }

  handleDelete = async (movie) => {
    const originalMovies = this.state.movies;

    const movies = originalMovies.filter(m => m._id !== movie._id);
    this.setState({ movies });

    try {
      await deleteMovie(movie._id);
    } catch (e) {
      if (e.response && e.response.status === 404) 
        toast.error('This movie has already been deleted.');
      
      this.setState({ movies: originalMovies });
    }
  }

  handleLike = movie => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index].liked = !movies[index].liked;

    this.setState({ movies });
  }

  handlePageChange = (currentPage) => {
    this.setState({ currentPage });
  }

  handleGenreSelct = (genre) => {
    this.setState({
      currentPage: 1,
      selectedGenre: genre,
      searchQuery: ''
    })
  }

  handleSearch = query => {
    this.setState({ 
      searchQuery: query, 
      selectedGenre: null, 
      currentPage: 1 
    });
  }
  
  handleSort = sortColumn => {
    this.setState({ sortColumn})
  }

  getPagedData = () => {
    const { 
      movies: allMovies, 
      currentPage, 
      pageSize, 
      selectedGenre, 
      searchQuery,
      sortColumn 
    } = this.state;

    let filtered = allMovies;
    if (searchQuery)
      filtered = allMovies.filter(m =>
        m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else if (selectedGenre && selectedGenre._id)
      filtered = allMovies.filter(m => m.genre._id === selectedGenre._id) 

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order])

    const movies = paginate(sorted, currentPage, pageSize);

    return {
      totalCount: filtered.length,
      data: movies
    }
  }

  render() { 
    const { length: count } = this.state.movies; 
    const { 
      currentPage, 
      pageSize, 
      sortColumn,
      searchQuery
    } = this.state;
    const { user } = this.props;
    
    if (count === 0) return <p>There are no movies in the database.</p>;

    const { totalCount, data } = this.getPagedData();
    
    return (  
      <div className="container">
        <div className="row">
          <div className="col-3">
            <ListGroup  
              items={this.state.genres}
              selectedItem={this.state.selectedGenre}
              onItemSelect={this.handleGenreSelct}
            />
          </div>
          <div className="col">
            { user && <Link
              to="/movies/new"
              className="btn btn-primary"
              style={{ marginBottom: 20 }}
            >
              New Movie
            </Link> }
            <p>Showing {totalCount} movies in the database.</p>
            <SearchBox value={searchQuery} onChange={this.handleSearch} />
            <MoviesTable 
              movies={data}
              sortColumn={sortColumn}
              onLike={this.handleLike}
              onDelete={this.handleDelete}
              onSort={this.handleSort}
            />      
            <Pagination 
              itemsCount={totalCount} 
              pageSize={pageSize} 
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
            /> 
          </div>
        </div>
      </div>
    );
  }
}
 
export default Movies;