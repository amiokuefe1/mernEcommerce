import React from 'react'

function UserCardBlock() {

	const renderCartImage =(images) => {
		if(images.length > 0) {
			let image = images[0]
			return `http://localhost:5000/${image}`
		}
	}

	const renderItems = () => {
		props.products && props.product.map(product => (
			  <tr key={product._id}>
			  	<td>
			  		<img style={{ width: '700px'}} alt="product" src />
			  	</td>
			  	<td> {product.quantity} EA </td>
			  	<td> $ {product.price} </td>
			  	<td><button onClick{() => props.removeItem(product._id)}> Remove </button> </td>
			  </tr>
			))
	}

	return (
	  <div>
	     <table>
	     	<thead>
	     	  <tr>
	     	  	<th> Product Image </th>
	     	  	<th> Product Quantity </th>
	     	  	<th> Product Price </th>
	     	  	<th> Remove from Cart </th>
	     	  </tr>
	     	</thead>
	     	<tbody>
	     		{renderItems()}
	     	</tbody>
	     </table>
	  </div>
		)
}

export default UserCardBlock