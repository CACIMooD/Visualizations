//
// D3 Lollipop chart
// https://www.d3-graph-gallery.com/graph/lollipop_ordered.html
//
//    Entry function declaration
//
import * as d3 from 'd3'
// import * as d3Scale from "d3-scale"
/**
 *
 * @param {object} config MooD visualisation config object
 */
export function visualization (config) {
  //
  // Retrieve graph configuration
  //
  try {
    const style = config.style
    const margin = style.margin
    const lineStroke = style.lineStroke
    const circleStroke = style.circleStroke
    const circleFill = style.circleFill
    const circleRadius = style.circleRadius
    const includeXZero = style.includeXZero
    const width = parseFloat(config.width) - margin.left - margin.right
    const height = parseFloat(config.height) - margin.top - margin.bottom
    //
    //    append the svg to the element in MooD config
    //
    // set the dimensions and margins of the graph
    // append the svg object to the body of the page
    const svg = d3.select('#' + config.element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
    //
    //    Read the data
    //
    const data = config.data.rows
    // sort data
    data.sort(function (b, a) {
      return a.value - b.value
    })
    // console.log(JSON.stringify(data))
    //
    // Identify range of values for X axis
    //
    const xMin = data[data.length - 1].value
    const xMax = data[0].value
    const domainMin = (xMin > 0 && includeXZero) ? 0 : xMin
    const domainMax = (xMax < 0 && includeXZero) ? 0 : xMax

    // Add X axis
    const x = d3.scaleLinear()
      .domain([domainMin, domainMax]).nice()
      .range([0, width])
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
    //
    // Record starting x value for the lines (rounded domain minimum)
    //
    const xDomainStart = x.domain()[0]

    // Y axis
    const y = d3.scaleBand()
      .range([0, height])
      .domain(data.map(function (d) { return d.name }))
      .padding(1)
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('.tick text')
      .call(wrap, margin.left - 20)

    // Lines
    svg.selectAll('myline')
      .data(data)
      .enter()
      .append('line')
      .attr('x1', function (d) { return x(d.value) })
      .attr('x2', x(xDomainStart))
      .attr('y1', function (d) { return y(d.name) })
      .attr('y2', function (d) { return y(d.name) })
      .attr('stroke', lineStroke)

    // Circles
    svg.selectAll('mycircle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function (d) { return x(d.value) })
      .attr('cy', function (d) { return y(d.name) })
      .attr('r', circleRadius)
      .style('fill', circleFill)
      .attr('stroke', circleStroke)

    function wrap (text, width) {
      text.each(function () {
        const text = d3.select(this)
        const words = text.text().split(/\s+/).reverse()
        let line = []
        const lineHeight = 1.1 // ems
        const y = text.attr('y')
        const dy = parseFloat(text.attr('dy'))
        const x = parseFloat(text.attr('x'))
        let tspan = text.text(null).append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', dy + 'em')
        let word = words.pop()
        while (word) {
          line.push(word)
          tspan.text(line.join(' '))
          // console.log('Text: "' + tspan.text() + '" length: ' + tspan.node().getComputedTextLength())
          if (tspan.node().getComputedTextLength() > width) {
            line.pop()
            tspan.text(line.join(' '))
            line = [word]
            tspan = text.append('tspan')
              .attr('x', x)
              .attr('y', y)
              .attr('dy', `${lineHeight}em`)
              .text(word)
          }
          word = words.pop()
        }
      })
    }
  } catch (e) {
    //
    // Write error message to the canvas
    //
    console.log('Error caught')
    const el = document.getElementById(config.element)
    const errorMessage = e.name + ': ' + e.message
    console.log('Error: ' + errorMessage)

    const errorEl = document.createElement('text')
    errorEl.style.margin = 'auto'
    errorEl.style.textAlign = 'center'
    errorEl.style.display = 'block'
    errorEl.innerText = errorMessage
    el.appendChild(errorEl)
    //
    // Report error to MooD BA
    //
    config.functions.errorOccurred(errorMessage)
  }
}
