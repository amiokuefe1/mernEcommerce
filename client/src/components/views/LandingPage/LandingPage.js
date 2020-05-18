import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import CheckBox from './Sections/CheckBox'
import RadioBox from './Sections/RadioBox'
import SearchFeature from './Sections/SearchFeature'
import {continents, price} from './Sections/Datas'
import { FaCode } from 'react-icons/fa'
import {Icon, Col, Card, Row} from 'antd'
import ImageSlider from '../../utils/ImageSlider'

const { Meta } = Card;

function LandingPage() {

	const [Products, setProducts] = useState([])
	const [Skip, setSkip] = useState(0)
	const [Limit, setLimit] = useState(8)
	const [PostSize, setPostSize] = useState(0)
	//the above monitors whether the products are above 8 as to display the load more button or when the all products are exhausted the load more button will disappear

	const [Filters, setFilters] = useState({
		continents: [],
		price: []
	})

	const [SearchTerms, setSearchTerms] = useState("")

	useEffect(()=>{

		const variables = {
			skip: Skip,
			limit: Limit
		}//display the first 8 products from mongoDB on page load

		getProducts(variables)
		//fetch products including the no. of product display constraints; every time page loads

	}, [])

	const getProducts = (variables) =>{		
		Axios.post('/api/product/getProducts', variables)
		  .then(response => {
		  	if (response.data.success) {

		  		if(variables.loadMore){
		  			setProducts([...Products, ...response.data.products])
		  		// keep existing products displayed + fetch new products requested/queried for
		  	} else {
		  		setProducts(response.data.products)
		  		// keep existing products displayed + fetch new products requested/queried for
		  	}


		  		setProducts([...Products, ...response.data.products])
		  		// keep existing products displayed + fetch new products requested/queried for

		  		setPostSize(response.data.postSize)

		  		console.log(response.data.products)

		  	} else {
		  		alert('failed to fetch product data')
		  	}
		  })
	
	} //this method does fetch all products from mongoDB + receive a parameter(variables) to determine how many results will display

	const onLoadMore = () => {
		let skip = Skip + Limit; // prev + 8

		const variables = {
			skip: skip,
			limit: Limit,
			loadMore: true
			
		} //skip adding prev products + add new 8 products

		getProducts(variables)
		//fetch products including the no. of product display constraints; every time we click on the button load more

		setSkip(skip)
	}

	const renderCards = Products.map((product, index) => {

		return <Col lg={6} md={8} xs={24}>
			<Card 
				hoverable={true}
				cover={<a href={`/product/${product._id}`}> <ImageSlider images={product.images} /></a> }
			>
				<Meta
					title={product.title}
					description={`$${product.price}`}
				/>
			</Card>
		  </Col>
	}) //the above is a product card mixin

	
	const showFilteredResults = (filters) => {
			const variables = {
			skip: 0,
			limit: Limit,
			filters: filters
			
		} //skip adding prev products + add new 8 products

		getProducts(variables)
		//fetch products including the no. of product display constraints; every time we click on the button load more

		setSkip(0)
	}

	const handlePrice = (value) => {
		const data = price;

		let array = [];

		for (let key in data) {
			console.log('key', key)
			console.log('value', value)
			if(data[key]._id === parseInt(value, 10)) {
				array = data[key].array;
			}
		}
		console.log('array', array)
		return array
	}


	const handleFilters = (filters,  category) => {

		console.log(filters)
		
		const newFilters = {...Filters}
		console.log(newFilters)

		newFilters[category] = filters

		if (category === "price") {
			let priceValues = handlePrice(filters)
		}

		console.log(newFilters)

		showFilteredResults(newFilters)
		setFilters(newFilters)

	}

	const updateSearchTerms = (newSearchTerm) => {
		
		console.log(newSearchTerm)

		const variables = {
			skip:0,
			limit: Limit,
			filters: Filters,
			searchTerm: newSearchTerm
		}

		setSkip(0)
		setSearchTerms(newSearchTerm)
		getProducts(variables)
	}
    return (
        <div style={{ width: '75%', margin: '3rem auto' }}>
            <div style={{ textAlign: 'center'}}>
            	<h2> Let's Travel Anywhere <Icon type="rocket" /> </h2>
            </div>

	        <Row gutter = {[16, 16]}>
	        	<Col lg={12} xs={24}>
	        		{/* Filter */}
	         <CheckBox
	         	list={continents}
	         	handleFilters={ filters => handleFilters(filters, "continents")}
	          />
	        	</Col>
	        	<Col lg={12} xs={24}>
	        		
	         <RadioBox
	         	list={price}
	         	handleFilters={ filters => handleFilters(filters, "price")}
	          />
	        	</Col>
	        </Row>


	        {/* Search */}
	        <div style={{display:'flex', justifyContent:'flex-end', margin:'1rem auto'}}>
	        	<SearchFeature
	        		refreshFunction={updateSearchTerms}
	        	/>
	        </div>
	        
	        


	        {Products.length === 0 ? 
	        	<div style={{ display: 'flex', height: '300px', justifyContent: 'center', alignItems: 'center'}}>
	        		<h2> No post yet... </h2>
	        	</div> :

	        	<div>
	        		<Row gutter={[16,16]}>

	        			{renderCards}

	        		</Row>
	        	</div>

	        }

	        <br /> <br />
	       
	        { PostSize >= Limit && 

	        	<div style={{ display: 'flex', justifyContent: 'center'}}>
	        	<button onClick={onLoadMore}> Load More </button>

	            {/*<FaCode style={{ fontSize: '4rem' }} /><br />
	            <span style={{ fontSize: '2rem' }}>Let's Start Coding!</span>*/}
	       		 </div>

	        }

        </div>
        
    )
}

export default LandingPage;
