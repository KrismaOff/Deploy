import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { data } from '../data';

const Graph = () => {
    const svgRef = useRef();

    const uniqueMainSkills = data.map(d => d.mainSkills).flat().filter((item, i) => data.map(d => d.mainSkills).flat().indexOf(item) === i)
    const uniqueOtherSkills = data.map(d => d.otherSkills).flat().filter((item, i) => data.map(d => d.otherSkills).flat().indexOf(item) === i)

    useEffect(() => {
        const width = 1500;
        const height = 1200;
        const radius = 500;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const pie = d3.pie().value(() => 1);

        const linkGenerator = d3.linkRadial()
            .angle((d) => d.angle)
            .radius((d) => d.radius);






        // Внешнее кольцо
        const outerArc = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius - 5);

        const outerGroup = svg.selectAll('outerArc')
            .data(pie(uniqueMainSkills))
            .enter()
            .append('g')
            .attr('class', 'outerArc');

        outerGroup.append('path')
            .attr('d', outerArc)
            .attr('fill', 'grey');

        outerGroup.append('circle')
            .attr('cx', function (d) {
                const [x] = outerArc.centroid(d);
                return x;
            })
            .attr('cy', function (d) {
                const [, y] = outerArc.centroid(d);
                return y;
            })
            .attr('r', 20)
            .attr('fill', 'orange')
            .attr('stroke', 'none');

        outerGroup.append('text')
            .attr('class', 'skill-text')
            .attr('data-skill', d => d.data)
            .attr('transform', function (d) {
                const [x, y] = outerArc.centroid(d);
                const angle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);

                if (angle < 90 || angle > 270) return `translate(${x},${y - 50})`;
                else return `translate(${x},${y + 50})`;

            })
            .attr('dy', '0.35em')
            .text((d, i) => uniqueMainSkills[i])
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', 'gray');







        // Внутреннее кольцо
        const innerArc = d3.arc()
            .innerRadius(radius - 250)
            .outerRadius(radius - 260);

        const innerGroup = svg.selectAll('innerArc')
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', 'innerArc');

        innerGroup.append('path')
            .attr('d', innerArc)
            .attr('fill', '#97979788');

        innerGroup.append('circle')
            .attr('cx', function (d) {
                const [x] = innerArc.centroid(d);
                return x;
            })
            .attr('cy', function (d) {
                const [, y] = innerArc.centroid(d);
                return y;
            })
            .attr('r', 20)
            .attr('fill', '#97979788')
            .attr('stroke', 'none');

        innerGroup.append('text')
            .attr('data-skill', d => d.data)
            .attr('transform', function (d) {
                const [x, y] = innerArc.centroid(d);
                const angle = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);
                if (angle < 90 || angle > 270) return `translate(${x},${y - 40})`;
                else return `translate(${x},${y + 40})`;
                // return `translate(${x},${y})`;
            })
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '14px')
            .each(function (d) {
                const text = d3.select(this);
                const words = d.data.name.split(' ');
                words.forEach((word, index) => {
                    text.append('tspan')
                        .attr('x', 0)
                        .attr('dy', index === 0 ? '0em' : '1.2em')
                        .text(word);
                });
            });



        function changeTextColor(skills, color) {
            skills.forEach(skill => {
                d3.selectAll(`.skill-text[data-skill="${skill}"]`)
                    .transition()
                    .duration(500)
                    .style('fill', color);
            });
        }


        function drawLine(sourceCoords, targetCoords, strokeColor, strokeClass) {
            const [x1, y1] = sourceCoords;
            const [x2, y2] = targetCoords;

            const source = { angle: Math.atan2(y1, x1), radius: Math.sqrt(x1 * x1 + y1 * y1) };
            const target = { angle: Math.atan2(y2, x2), radius: Math.sqrt(x2 * x2 + y2 * y2) };

            svg.append('path')
                .attr('d', linkGenerator({ source, target }))
                .attr('stroke', strokeColor)
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('class', `dynamic-line ${strokeClass}`)
                .style('opacity', 1)
                .attr('stroke-dasharray', function () {
                    return this.getTotalLength();
                })
                .attr('stroke-dashoffset', function () {
                    return this.getTotalLength();
                })
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);
        }

        // Внутренний клик
        innerGroup.on('click', function (e, d) {
            const clickedCompetence = d.data.name;

            d3.selectAll('.skill-text')
                .transition()
                .duration(500)
                .style('fill', 'grey');

            d3.selectAll('.dynamic-line')
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', function () {
                    return this.getTotalLength();
                })
                .style('opacity', 0)
                .remove();

            const [x1coord, y1coord] = innerArc.centroid(d);
            const sourceCoords = [y1coord * -1, x1coord];
            const clickedCompetenceData = data.find(item => item.name === clickedCompetence);
            const relatedSkills = [...(clickedCompetenceData.mainSkills || []), ...(clickedCompetenceData.otherSkills || [])];

            if (relatedSkills.length === 0) return;

            changeTextColor(clickedCompetenceData.mainSkills, 'black');
            changeTextColor(clickedCompetenceData.otherSkills, 'black');

            relatedSkills.forEach(skill => {
                let skillIndex = uniqueMainSkills.indexOf(skill);
                if (skillIndex === -1) skillIndex = uniqueOtherSkills.indexOf(skill);

                if (skillIndex !== -1) {
                    const skillNode = pie(uniqueMainSkills)[skillIndex];
                    const [x2coord, y2coord] = outerArc.centroid(skillNode);
                    const targetCoords = [y2coord * -1, x2coord];

                    const strokeColor = clickedCompetenceData.mainSkills.includes(skill) ? 'orange' : 'purple';
                    drawLine(sourceCoords, targetCoords, strokeColor, clickedCompetence);
                }
            });
        });

        // Внешний клик
        outerGroup.on('click', function (e, d) {
            const clickedSkill = d.data;

            // Сброс всех цветов текста перед новой обработкой
            d3.selectAll('.skill-text')
                .transition()
                .duration(500)
                .style('fill', 'gray');

            d3.selectAll('.dynamic-line')
                .transition()
                .duration(500)
                .style('opacity', 0)
                .remove();

            const relatedProfessions = data.filter(profession => profession.mainSkills.includes(clickedSkill) || profession.otherSkills.includes(clickedSkill));

            relatedProfessions.forEach(profession => {
                const professionNode = pie(data).find(p => p.data.name === profession.name);
                const [x1coord, y1coord] = innerArc.centroid(professionNode);
                const sourceCoords = [y1coord * -1, x1coord];

                const strokeColor = profession.mainSkills.includes(clickedSkill) ? 'orange' : 'purple';
                let skillIndex = uniqueMainSkills.indexOf(clickedSkill);
                if (skillIndex === -1) skillIndex = uniqueOtherSkills.indexOf(clickedSkill);

                if (skillIndex !== -1) {
                    const skillNode = pie(uniqueMainSkills)[skillIndex];
                    const [x2coord, y2coord] = outerArc.centroid(skillNode);
                    const targetCoords = [y2coord * -1, x2coord];

                    drawLine(targetCoords, sourceCoords, strokeColor, 'outer-click');
                }
            });
        });



    });

    return <svg ref={svgRef}></svg>;
};

export default Graph;

