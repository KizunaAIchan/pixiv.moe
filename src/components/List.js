import '../styles/Base.css';
import '../styles/List.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Masonry from 'react-masonry-component';
import fetchJsonp from 'fetch-jsonp';

import config from 'config';

import Item from './Item';
import Image from './Image';
import Loading from './Loading';
import Refresh from './Refresh';


class ListComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      currentPage: 0,
      isFirstLoadCompleted: false,
      lastId: 0,
      originalTitle: 'Pixivのラブライブ発見',
      newCount: 0,
      items: [],
      images: []
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeListener.bind(this));
    window.addEventListener('scroll', this.scrollListener.bind(this));

    this.fetchSource(true);
    this.resizeListener();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener.bind(this));
    window.removeEventListener('scroll', this.scrollListener.bind(this));
  }

  scrollListener() {
    if (this.state.isLoading) {
      return;
    }
    const el = ReactDOM.findDOMNode(this);
    const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    if (this.topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < 250) {
      this.fetchSource(false);
    }

  }

  topPosition(domElem) {
    if (!domElem) {
      return 0;
    }
    return domElem.offsetTop + this.topPosition(domElem.offsetParent);
  }

  onRefreshClick() {
    this.setState({
      items: [],
      images: [],
    });

    this.refresh.animate(true);

    this.fetchSource(true, () => {
      this.refresh.animate(false);
    });
  }

  fetchSource(isFirstLoad, callback = null) {
    if (this.state.isLoading) {
      return;
    }
    this.loading.show();
    this.setState({
      isLoading: true
    });
    let currentPage = isFirstLoad ? 0 : this.state.currentPage;
    fetchJsonp(config.sourceURL + '?page=' + (++currentPage), {
      method: 'get',
      timeout: 15e3
    })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        if (data.status == 'success' && data.count > 0) {
          Object.keys(data.response).map((key) => {
            const elem = data.response[key];
            this.setState({
              items: this.state.items.concat(elem),
              images: this.state.images.concat({
                uri: elem.image_urls.px_480mw,
                title: elem.title
              })
            });
          });
        } else {
          this.setState({
            isFailureHidden: false
          });
        }
      })
      .then(() => {
        if (isFirstLoad) {
          this.setState({
            isFirstLoadCompleted: true
          });
        }
      })
      .then(() => {
        this.setState({
          isLoading: false,
          currentPage: currentPage
        })
      })
      .then(() => {
        typeof callback === 'function' && callback();
        this.loading.hide();
      })
      .catch((ex) => {
        throw ('parsing failed', ex);
      });
  }

  resizeListener() {
    /* reset size of masonry-container when window size change */
    let node = this.root,
      cellClassName = 'cell';

    // try to get cell width
    let temp = document.createElement('div');
    temp.setAttribute('class', cellClassName);
    document.body.appendChild(temp);

    let cellWidth = temp.offsetWidth,
      cellMargin = 8,
      componentWidth = cellWidth + 2 * cellMargin,
      maxn = Math.floor(document.body.offsetWidth / componentWidth);

    node.style.width = String(maxn * componentWidth + 'px');
    document.body.removeChild(temp);
  }

  render() {
    return (
      <div
           ref={ (ref) => this.root = ref }
           style={ { margin: '0 auto' } }>
        <Masonry
                 className={ 'masonry' }
                 elementType={ 'div' }
                 options={ { transitionDuration: 0 } }
                 disableImagesLoaded={ false }
                 updateOnEachImageLoad={ false }>
          { this.state.items.map((elem, index) => {
              return <Item
                           key={ index }
                           item={ elem }
                           onClick={ () => this.image.openLightbox(index) } />
            }) }
        </Masonry>
        <Loading ref={ (ref) => this.loading = ref } />
        <Refresh
                 ref={ (ref) => this.refresh = ref }
                 onClick={ this.onRefreshClick.bind(this) } />
        <Image
               ref={ (ref) => this.image = ref }
               images={ this.state.images } />
      </div>
      );
  }
}

export default ListComponent;