import { describe, expect, it } from 'vitest'

import { React } from '../vnode'

describe('createElement', () => {
	it('happy path', () => {
		const dom = React.createElement('div', {}, 'app')
		expect(dom).toMatchInlineSnapshot(`
			{
			  "props": {
			    "children": [
			      {
			        "props": {
			          "children": [],
			          "nodeValue": "app",
			        },
			        "type": "TEXT_ELEMENT",
			      },
			    ],
			  },
			  "type": "div",
			}
		`)
	})

	it('nested element', () => {
		const dom = React.createElement(
			'div',
			{},
			React.createElement('span', null, '123')
		)
		expect(dom).toMatchInlineSnapshot(`
			{
			  "props": {
			    "children": [
			      {
			        "props": {
			          "children": [
			            {
			              "props": {
			                "children": [],
			                "nodeValue": "123",
			              },
			              "type": "TEXT_ELEMENT",
			            },
			          ],
			        },
			        "type": "span",
			      },
			    ],
			  },
			  "type": "div",
			}
		`)
	})
})
