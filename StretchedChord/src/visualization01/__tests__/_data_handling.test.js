const { testEnvironment } = require("../../../jest.config")

import { StretchedChord } from '../_data_handling'


var mockErrorOccurred = jest.fn(e => e)

const config = {
    "width": "800px",
    "height": "600px",
    "element": "visualisation01_element_guid",
    "functions": {
		"errorOccurred": mockErrorOccurred
    },
    "data" :
    {
	"nodes": [
		{"name": "Civilian Air Traffic Management", "id": "55-98BD01BFBAAE4DD79CBB5123E578EAAA"},
		{"name": "Coalition Strike Helo", "id": "55-5F49AE0DC27340FFB3B47B7B42E89EF1"},
		{"name": "Forward Operating Base", "id": "55-3D2F35B1EA0A4313B3D78979A3607C2C"},
		{"name": "HQ Afloat", "id": "55-8F18CFBF4CCE4AECBD51BA222A54CC52"},
		{"name": "Maritime Analysis & Operating Centre", "id": "55-0F79D6F9323048B6A298473A6148B004"},
		{"name": "Maritime Operating Base", "id": "55-0829A1C4D265467EA86F2757C260C86C"},
		{"name": "Maritime Patrol Aircraft", "id": "55-407BB9255C384C6FBC48EA759CFE01DB"},
		{"name": "Maritime Surveillance", "id": "55-0E3055F74D7245CAA50A2CE03EB128C0"},
		{"name": "Target", "id": "55-4016D99A171745239EE07C7F0AD10473"}
	], 
	"links": [
		{
			"source": {"id": "55-8F18CFBF4CCE4AECBD51BA222A54CC52"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-6D0DC9FD71F7408F9FE6677967E873C2", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-8F18CFBF4CCE4AECBD51BA222A54CC52"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-B92E0A9E180B494CB11A090E7C981B19", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-8F18CFBF4CCE4AECBD51BA222A54CC52"}, 
			"id": "41-5B291F7F6BBB40D589DBB720EE8555B0", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-8F18CFBF4CCE4AECBD51BA222A54CC52"}, 
			"id": "41-DBB04DCDE20647BA9CC1625DF53AE363", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-3D2F35B1EA0A4313B3D78979A3607C2C"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-E78C856D85A945B8BCFA0CCB9326A70D", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-3D2F35B1EA0A4313B3D78979A3607C2C"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-0E1BD52701BA4EE4B504CFDF1F7D3412", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-3D2F35B1EA0A4313B3D78979A3607C2C"}, 
			"id": "41-6CA7DDEFAC1A4211A8096AF65FF4861D", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-3D2F35B1EA0A4313B3D78979A3607C2C"}, 
			"id": "41-557ACEA758C64F66B5A40687BBD1DE29", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-0E3055F74D7245CAA50A2CE03EB128C0"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-BD30B54F23EE48BBAD39FE5DBE78C343", 
			"bw": 100, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0E3055F74D7245CAA50A2CE03EB128C0"}, 
			"id": "41-5489FC9A76944CE59D1B415F00D8A665", 
			"bw": 100, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-4016D99A171745239EE07C7F0AD10473"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-06E44AAE6AB24DB396BA6C73E8E2A120", 
			"bw": 100, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-98BD01BFBAAE4DD79CBB5123E578EAAA"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-4DD957634DFF4D24B67FB7F9271AD6D3", 
			"bw": 100, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-0F79D6F9323048B6A298473A6148B004"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-7A89E1DD6B284CEBACC170D680528AA9", 
			"bw": 100, 
			"criticality": "#0000FF"
		},
		{
			"source": {"id": "55-0F79D6F9323048B6A298473A6148B004"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-FA7425654C984655B7EEE7A634BD732A", 
			"bw": 100, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-0F79D6F9323048B6A298473A6148B004"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-59828EB6A160406A827E7A29C5AD11B1", 
			"bw": 100, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-0829A1C4D265467EA86F2757C260C86C"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-F8005D0FBEEC4D0A9830F3E92A3CF826", 
			"bw": 100, 
			"criticality": "#0000FF"
		},
		{
			"source": {"id": "55-0829A1C4D265467EA86F2757C260C86C"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-5F95B72350B24D898D0AA9105DF1D5C4", 
			"bw": 100, 
			"criticality": "#0000FF"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0F79D6F9323048B6A298473A6148B004"}, 
			"id": "41-59ACD309B8D64373817C32DD494874DF", 
			"bw": 100, 
			"criticality": "#0000FF"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0829A1C4D265467EA86F2757C260C86C"}, 
			"id": "41-E17EEDB66E77465C91C1DC3FD4745C4B", 
			"bw": 100, 
			"criticality": "#0000FF"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0F79D6F9323048B6A298473A6148B004"}, 
			"id": "41-D086DEB332BA4709B5332513E5A63BEE", 
			"bw": 500, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0829A1C4D265467EA86F2757C260C86C"}, 
			"id": "41-E986C591C9514710AF6DF49F8E824FC5", 
			"bw": 500, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0829A1C4D265467EA86F2757C260C86C"}, 
			"id": "41-108F6CC3F3BD4A348921A9C90C0AC6E7", 
			"bw": 500, 
			"criticality": "#0000FF"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0F79D6F9323048B6A298473A6148B004"}, 
			"id": "41-D2BA7C7250D84A928D03DD8F3525DA21", 
			"bw": 500, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0F79D6F9323048B6A298473A6148B004"}, 
			"id": "41-89C9BE319BEC4098B53D0461BDC3ABC1", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0829A1C4D265467EA86F2757C260C86C"}, 
			"id": "41-5DB77705E3DE4AC5A2B2B82404DB0D1A", 
			"bw": 1000, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0F79D6F9323048B6A298473A6148B004"}, 
			"id": "41-EE80184BF1B740F4A33DC70ACCFE9C58", 
			"bw": 500, 
			"criticality": "#0000FF"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0829A1C4D265467EA86F2757C260C86C"}, 
			"id": "41-AE135AFF9AFF48E1811C1A764A4CA6FA", 
			"bw": 500, 
			"criticality": "#0000FF"
		},
		{
			"source": {"id": "55-0E3055F74D7245CAA50A2CE03EB128C0"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-2D56886F97334BB0AC342483DD6E2567", 
			"bw": 500, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-0E3055F74D7245CAA50A2CE03EB128C0"}, 
			"id": "41-B2289973D1864C369B3E0CEDDB26AD8D", 
			"bw": 500, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-5F49AE0DC27340FFB3B47B7B42E89EF1"}, 
			"target": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"id": "41-418E0EBD4988458D9C3836D8DFA2DA30", 
			"bw": 500, 
			"criticality": "#FF0000"
		},
		{
			"source": {"id": "55-407BB9255C384C6FBC48EA759CFE01DB"}, 
			"target": {"id": "55-5F49AE0DC27340FFB3B47B7B42E89EF1"}, 
			"id": "41-ADEA2290DC1F4522BC4658B3C5900979", 
			"bw": 500, 
			"criticality": "#FF0000"
		}
    ]
    },
    "inputs" : {
    },
    "style" : {
        "animateAttr": 1
    }
}

test('Missing LHS Noded input', () => {

	const chord = new StretchedChord(config)

	expect(mockErrorOccurred.mock.calls[0][0]).toBe('The input for the \'Left Hand Side\' is required to render properly.')
})