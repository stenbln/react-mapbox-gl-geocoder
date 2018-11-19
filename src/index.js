import React, {Component} from 'react';
import PropTypes from 'prop-types';
import MapboxClient from 'mapbox';
import {WebMercatorViewport} from 'viewport-mercator-project';

class Geocoder extends Component {
    debounceTimeout = null;
    state = {
        results: []
    };
    onChange = (event) => {
        const {timeout, queryParams} = this.props;
        const query = event.target.value;

        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.client.geocodeForward(query, queryParams).then((res) => {
                this.setState({
                    results: res.entity.features
                });
            });
        }, timeout);
    };
    onSelected = (item) => {
        const {viewport, onSelected, transitionDuration, hideOnSelect, pointZoom} = this.props;
        let newViewport = new WebMercatorViewport(viewport);
        const {bbox, center} = item;

        if (bbox) {
            newViewport = newViewport.fitBounds([
                [bbox[0], bbox[1]],
                [bbox[2], bbox[3]]
            ]);
        } else {
            newViewport = {
                longitude: center[0],
                latitude: center[1],
                zoom: pointZoom
            };
        }

        const {longitude, latitude, zoom} = newViewport;

        onSelected({...viewport, ...{longitude, latitude, zoom, transitionDuration}}, item);

        if (hideOnSelect) {
            this.setState({results: []});
        }
    };

    constructor(props) {
        super();

        this.client = new MapboxClient(props.mapboxApiAccessToken);
    }

    render() {
        const {results} = this.state;
        const {formatItem, className, inputComponent, itemComponent} = this.props;

        const Input = inputComponent || 'input';
        const Item = itemComponent || 'div';

        return (
            <div className={`react-geocoder ${className}`}>
                <Input onChange={this.onChange} />

                {!!results.length &&
                <div className='react-geocoder-results'>
                    {results.map((item, index) => (
                        <Item
                            key={index} className='react-geocoder-item' onClick={() => this.onSelected(item)}
                            item={item}
                        >
                            {formatItem(item)}
                        </Item>
                    ))}
                </div>}
            </div>
        );
    }
}

Geocoder.propTypes = {
    timeout: PropTypes.number,
    queryParams: PropTypes.object,
    viewport: PropTypes.object.isRequired,
    onSelected: PropTypes.func.isRequired,
    transitionDuration: PropTypes.number,
    hideOnSelect: PropTypes.bool,
    pointZoom: PropTypes.number,
    mapboxApiAccessToken: PropTypes.string.isRequired,
    formatItem: PropTypes.func,
    className: PropTypes.string,
    inputComponent: PropTypes.element,
    itemComponent: PropTypes.element
};

Geocoder.defaultProps = {
    timeout: 300,
    transitionDuration: 0,
    hideOnSelect: false,
    pointZoom: 16,
    formatItem: item => item.place_name,
    queryParams: {},
    className: ''
};

export default Geocoder;
