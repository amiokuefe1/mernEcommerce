import React, {useState} from 'react'
import { Typography, Button, Form, message, Input, Icon } from 'antd'
// the above dependency can replace the original html tags with built in css it's so beautiful(in Donald Trump's Voice)
import Axios from 'axios'
import FileUpload from '../../utils/FileUpload.js'
// for drag & drop functionality

const {Title} = Typography;
const {TextArea} = Input;

const Continents = [
	{key: 1, value: "Africa"},
	{key: 2, value: "Europe"},
	{key: 3, value: "Asia"},
	{key: 4, value: "North America"},
	{key: 5, value: "South America"},
	{key: 6, value: "Australia"},
	{key: 7, value: "Antarctica"}
]

function UploadProductPage(props) {
	const [TitleValue, setTitleValue] = useState("")
	const [DescValue, setDescValue] = useState("")
	const [PriceValue, setPriceValue] = useState(0)
	const [ContinentValue, setContinentValue] = useState(1)

	const [Images, setImages] = useState([])

	const onTitleChange = (event) => {
		setTitleValue(event.currentTarget.value)
	}

	const onDescChange = (event) => {
		setDescValue(event.currentTarget.value)
	}

	const onPriceChange = (event) => {
		setPriceValue(event.currentTarget.value)
	}
	const onContinentsSelectChange = (event) => {
		setContinentValue(event.currentTarget.value)
	}

	const updateImages = (newImages) => {
		setImages(newImages)
	}

  const onSubmit = (event) =>{
    event.preventDefault();

    if (!TitleValue || !DescValue || !PriceValue || !ContinentValue || !Images) {
      return alert('fill all the field first')
    }

    const variables = {
      writer: props.user.userData._id,
      title:TitleValue,
      Desc: DescValue,
      price: PriceValue,
      images: Images,
      continents: ContinentValue
    }

    Axios.post('/api/product/uploadProduct', variables)
       .then(response => {
           if(response.data.success) {
              alert('Product successfully uploaded')
              props.history.push('/')
              // redirects you back to previous page
           } else {
               alert('Failed to upload Product')
           }
       })

  }

  return ( 
    <div style={{ maxWidth:'700px', margin:'2rem auto'}}>
      <div style={{ textAlign:'center', marginBottom:'2rem'}}>
    	<h2>Upload Travel Product</h2>
      </div>
      <Form  onSubmit={onSubmit} >
        {/* DropZone */}
        <FileUpload refreshFunction={updateImages} />

        <br />
        <br />
        <label> Title </label>
        <Input
          onChange={onTitleChange}
          value={TitleValue}
        />
        <br />
        <br />
        <label> Description </label>
       <TextArea
          onChange={onDescChange}
          value={DescValue}
       />
       <br />
       <br />
       <label>Price($) </label>
       <Input
          onChange={onPriceChange}
          value={PriceValue}
          type="number"
       />
       <br />
       <select onChange={onContinentsSelectChange}>
       	 {
       	 	Continents.map(item=> (
         <option key={item.key} value={item.key}>
         	{item.value}
         </option>

       	 	))
       	 }

       </select>
       <br />
       <br />

       <Button
       		onClick={onSubmit}
       >
       		Submit
       	</Button>



      </Form>
    </div>
  )
}

export default UploadProductPage