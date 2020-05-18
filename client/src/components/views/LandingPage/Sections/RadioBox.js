import React, {useState} from 'react';
import { Radio, Collapse} from 'antd';

const { Panel } = Collapse





function RadioBox(props) {
	
	const [value, setValue] = useState('0')

	const renderRadioBox = () => (
		props.list && props.list.map((value) => (
			 <Radio key={value._id} value={`${value._id}`}>{value.name}</Radio>
			))
	) //props.list. accesses the variable inside of Datas.js relevant to this Radio method

	const handleChange = (event) => {
		setValue(event.target.value)
		props.handleFilters(event.target.value)
	//update this checked information into Parent Component
	}

  return (  	
    <div>
    	<Collapse defaultActiveKey={['0']}>
    		<Panel header="price" key="1">
    			<Radio.Group onChange={handleChange} value={value}>
    				{renderRadioBox()}
    			</Radio.Group>
    		</Panel>
    	</Collapse>
    </div>
  )
}

export default RadioBox;