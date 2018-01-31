const TMDB_SEARCH_URL="https://api.themoviedb.org/3/search/movie";
let TMDB_SEARCH_URL_BY_MOVIE="https://api.themoviedb.org/3/movie/";
let movieId="";
let map;
let infowindow;
let query='';

//let latitude=0;
//let longitude=0;

//function to navigate slides
function startSlideShow(){
  $('.next').on('click', function(){
    let currentImg= $('.active');
    let nextImg=currentImg.next();

    //if last slide
    if(nextImg.length===0){
     nextImg = $('.slider-inner img').first();
    }
      currentImg.removeClass('active').css('z-index', -10);
      nextImg.addClass('active').css('z-index', 10);
  });

  $('.prev').on('click', function(){
    let currentImg= $('.active');
    let prevImg=currentImg.prev();

    //if last slide
    if(prevImg.length===0){
        prevImg = $('.slider-inner img').last();
    }
      currentImg.removeClass('active').css('z-index', -10);
      prevImg.addClass('active').css('z-index', 10);
  });
}

//function to display slide show and handle search movie title
function submitSearch(){
   startSlideShow();
   searchEntry();
 }

//function to search movie title
function searchEntry(){
   $('.js-search-form').submit(event =>{
    event.preventDefault();

    let searchTitle=$(event.currentTarget).find('.js-title');
    query=searchTitle.val();
    if(query==='')
    {
      alert("Please enter a valid Movie Title!");
    }
    else{
    console.log("submitSearch executed");
    console.log("Title to be searched = "+query);
    searchTitle.val("");
    getDataFromApi(query, searchMovies);
    }
  });
}

//get data from tmdb api
function getDataFromApi(searchTerm, callback) {
  const queryStr = {
      query: `${searchTerm}`,
    api_key: '71d8a05491c71c53e93482191527ca50'
  };
  console.log("getDataFromApi Executed");
  $.getJSON(TMDB_SEARCH_URL, queryStr, callback);
}

//Render movie search result in 3 col
function renderResult(result) {
  let resMovTitle=`${result.title}`;
  let resAltTitle=resMovTitle.slice(0,12);
  return `<div class='col-4'>
              <div class="card  well text-center">
                <img class="card-image" src="http://image.tmdb.org/t/p/w780/${result.poster_path}" alt=${result.title}/>
                <div class="card-content">
                  <p class="movieTitle">${resAltTitle}</p>
                  <a onclick="movieSelected('${result.id}')" class  ="movieDetails btn btn-primary" href="#" style="color:#146F79;">Movie Details</a>
                </div>
              </div>
        </div>`;
}

//Using the search title display results in html
function searchMovies(data) {
 console.log("searchMovies Executed");
 //If no movies match the entry in tmdb
 if(data.results.length===0)
 {
   alert("No movie title matching "+query+". Please enter a valid Movie Title!");
 }
 else{
 const movieSearchResults = data.results.map((item, index) => renderResult(item));
 //console.log("result="+movieSearchResults);
 $('#aboutUsSec').remove();
 $('#search').remove();
  $('#movies').html(movieSearchResults);
 getMovie();
}

}

//get single movie id from sessionStorage
function movieSelected(id){
  sessionStorage.setItem('movieId', id);
  return false;
}

//Use movie id to call tmdb api
function getMovie(){
  console.log("getMovie Executed. Movie id= "+movieId);
  $('.movieDetails').click(event =>{
    event.preventDefault();
    movieId=sessionStorage.getItem('movieId');
   getMovieDetailFromApi(movieId,searchMovieDetail);
  });
}

//get details for single movie with movie id from tmdb api
function getMovieDetailFromApi(searchTerm, callback) {

  const query = {
    api_key: '71d8a05491c71c53e93482191527ca50'
  };

  TMDB_SEARCH_URL_BY_MOVIE+=(`${movieId}`);
  console.log(TMDB_SEARCH_URL_BY_MOVIE);

  console.log("getMovieDetailFromApiFromApi Executed");
  $.getJSON(TMDB_SEARCH_URL_BY_MOVIE, query, callback);
}

//render single movie poster and details side by side
function renderSingleMovie(result) {
 console.log("renderSingleMovie Executed");
 let genresList='';
 for(let i=0;i<result.genres.length;i++){
   if(i>0){
     genresList+=', ';
   }
   genresList+=result.genres[i].name;
 };
 console.log(`${genresList}`);
  return `<div class="container">
           <div class="singleMovieCard ">
           <div class="col-6">
              <img src="http://image.tmdb.org/t/p/w780/${result.poster_path}" class="thumbnail"/>
              </div>
              <div class="col-6 movieInfo">
                <p>Title : <span>${result.original_title}</span></p>
                <p>Genres: <span>${genresList}</span></p>
                <p>Release Date : <span>${result.release_date}</span></p>
                <p>Home page : <span><a href=${result.homepage} style="color:#146F79;">${result.homepage}</a></span></p>
                <p>Tag Line : <span>${result.tagline}</span></p>
                <p>Overview : <span>${result.overview}</span></p>
              </div>
           </div>
           </div>
        </div>`;
}

//search movie with id , render with details along with map to display nearby movie theaters
function searchMovieDetail(data){
console.log("searchMovies Executed");
 const singleMovie = renderSingleMovie(data);
 console.log("result="+singleMovie);
 $('#slides').remove();
 $('#search').remove();
 $('#movies').html(singleMovie);
}

// Using Places library.
// Find user location
function getMyLocation(){
  if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(displayLocation);
  } else{
      alert("Sorry, no geolocation support");
  }
  }

//get location and display map
function displayLocation(position){
  let latitude=position.coords.latitude;
  let longitude=position.coords.longitude;
  let latLng= new google.maps.LatLng(latitude,longitude);

  showMap(latLng);
  addNearByPlaces(latLng);
  apiMarkerCreate(latLng);
  }

//display map in map section of html
function showMap(latLng) {
  map = new google.maps.Map(document.getElementById('map'), {
        center: latLng,
        zoom: 10
        });
 }

//find near by movie theaters
function addNearByPlaces(latLng){
  infowindow = new google.maps.InfoWindow();
  let service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
          location: latLng,
          radius: 10000,
          type: ['movie_theater']
        }, callback);
  }

//Using place services of google api
function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      let place=results[i];
      apiMarkerCreate(place.geometry.location, place);
    }
  }
 }

//create markers for places
function apiMarkerCreate(latLng,place) {
  let marker = new google.maps.Marker({
          map: map,
          position: latLng
  });
  google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent('<div><strong>' + place.name +'</div>');
          infowindow.open(map, this);
        });
 }

$(submitSearch());
