import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import MoviesPage from '../../components/MoviesPage/MoviesPage'
import Footer from './../../components/Footer/Footer';

const Movie = () => {
  return (
    <div>
      <Navbar/>
      <MoviesPage/>
      <Footer/>
    </div>
  )
}

export default Movie
