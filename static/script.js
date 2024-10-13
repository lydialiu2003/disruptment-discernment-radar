const segmentDefinitions = {
    "Trailblazer": "Trailblazer (Seek change / Act Independently): An individual, group, or entity that pioneers new pathways and breaks new ground, methods, or innovations, often venturing into uncharted territories or challenging long-established norms. Trailblazers require bold individual action to set precedents, opening doors for others to follow, and are characterized by their boldness and visionary approach.",
    "Accelerant": "Accelerant: Refers to a factor or catalyst that rapidly enhances or amplifies the impact of innovative change. It speeds up the adoption of new ideas, technologies, or processes, leading to significant, often beneficial, shifts in a system or industry.",
    "Sparker": "Sparker: An entity or individual who provides the initial impetus or ideas that hint at or inspire larger changes. While they might not carry out the full transformation themselves, their initial efforts, insights, or provocations are essential for setting the stage for broader shifts or disruptions.",
    "Torch Bearer": "Torchbearer (Seek change / Act Collaboratively): Guiding others along your disruptive path, and encouraging them to further carry out positive disruption. Imagine this person lighting the way for other people, seeing the disruptive path to allow others to continue on their disruptive journey.",
    "Illuminator": "Illuminator: A less actionable version of a torch bearer, this person shows others the disruptive path and provides explanations to others about their ideas, showing support and hopes to carry them out.",
    "Stoker": "Stoker: An individual responsible for fueling and tending a furnace or boiler, ensuring it burns efficiently.",
    "Fire Chief": "Fire Chief (Seek stability / Act Collaboratively): The Fire Chief works with and through others to address disruptions, recognizing that a movement away from chasing a new opportunity and seeking stability might be the most disruptive move at the moment.",
    "Tinder Gatherer": "Tinder Gatherer (Seek Clarity / Provide Support): An individual or entity that actively collects and curates the initial ideas, resources, or inspirations necessary to ignite a transformative change. They lay the groundwork for larger movements, just as gathering tinder is a crucial first step in starting a fire.",
    "Prepper": "Prepper: Someone who prepares and organizes resources, strategies, or plans in anticipation of future changes or innovations. While they may not initiate the disruption, they ensure that when it happens, there's a well-prepared response or strategy to harness the change for positive outcomes.",
    "Firefighter": "Firefighter (Seek stability / Act independently): An individual or event that actively halts or nullifies the impact of a disruptive change.",
    "De-oxygenator": "De-oxygenator: An agent that subtly reduces the vitality of a disruptive change by removing essential elements, gradually weakening its progress.",
    "Burn Manager": "Burn Manager: Someone responsible for overseeing and managing controlled disruptions, ensuring they remain productive and don't become destructive.",
};

async function analyzeText() {
    const text = document.getElementById('inputText').value;
    const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });
    const result = await response.json();

    if (text.trim() === '') {
        document.getElementById('result').textContent = '';
        document.getElementById('segment-definition').classList.add('hidden');
        return;
    }

    drawPoint(result.x, result.y, result.percentIndividualistic, result.percentCommunal, result.percentChangeSeeking, result.percentChangeAverse);
    displayQuadrant(result.x, result.y);

    if (result.x !== 0 || result.y !== 0) {
        displaySegmentLabel(result.x, result.y);
    }

    updateChart(result.percentIndividualistic, result.percentCommunal, result.percentChangeSeeking, result.percentChangeAverse, result.countIndividualistic, result.countCommunal, result.countChangeSeeking, result.countChangeAverse);
    document.getElementById('quadrant-container').classList.remove('hidden');
    document.getElementById('chart-container').classList.remove('hidden');
}

function drawPoint(originalX, originalY, percentIndividualistic, percentCommunal, percentChangeSeeking, percentChangeAverse) {
    const quadrant = document.getElementById('quadrant');
    quadrant.innerHTML = `
        <div class="axis horizontal"></div>
        <div class="axis vertical"></div>
        <div class="arrow horizontal right"></div>
        <div class="arrow horizontal left"></div>
        <div class="arrow vertical top"></div>
        <div class="arrow vertical bottom"></div>
        <div class="ring inner"></div>
        <div class="ring middle"></div>
        <div class="ring outer"></div>
        <div class="segment-label" id="segment-sparker">Sparker</div>
        <div class="segment-label" id="segment-accelerant">Accelerant</div>
        <div class="segment-label" id="segment-trailblazer">Trailblazer</div>
        <div class="segment-label" id="segment-illuminator">Illuminator</div>
        <div class="segment-label" id="segment-stoker">Stoker</div>
        <div class="segment-label" id="segment-prepper">Prepper</div>
        <div class="segment-label" id="segment-burn-manager">Burn <br>Manager</div>
        <div class="segment-label" id="segment-de-oxygenator">De-oxygenator</div>
        <div class="segment-label" id="segment-firefighter">Firefighter</div>
        <div class="segment-label" id="segment-torch-bearer">Torch Bearer</div>
        <div class="segment-label" id="segment-fire-chief">Fire Chief</div>
        <div class="segment-label" id="segment-tinder-gatherer">Tinder Gatherer</div>
    `;

    // Clipping logic
    let x = originalX;
    let y = originalY;
    const scaleX = 200;
    const scaleY = 200;

    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 1; // Maximum distance in normalized coordinates
    if (distance > maxDistance) {
        const scaleFactor = maxDistance / distance;
        x *= scaleFactor;
        y *= scaleFactor;
    }

    const point = document.createElement('div');
    point.className = 'point';
    point.style.top = `calc(50% - 7.5px + ${-y * scaleY}px)`;
    point.style.left = `calc(50% - 7.5px + ${x * scaleX}px)`;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = `
        Individualistic: ${(percentIndividualistic * 100).toFixed(2)}%<br>
        Communal: ${(percentCommunal * 100).toFixed(2)}%<br>
        Change-Seeking: ${(percentChangeSeeking * 100).toFixed(2)}%<br>
        Change-Averse: ${(percentChangeAverse * 100).toFixed(2)}%
    `;
    point.appendChild(tooltip);

    quadrant.appendChild(point);

    // Call displaySegmentLabel with original (unclipped) coordinates
    displaySegmentLabel(originalX, originalY);
}

function displayQuadrant(x, y) {
    let quadrantText;
    
    if (x === 0 && y === 0) {
        quadrantText = "Neutral";
    } else if (x === 0 && y !== 0) {
        quadrantText = y > 0 ? "Neutral and Change-Seeking" : "Neutral and Change-Averse";
    } else if (y === 0 && x !== 0) {
        quadrantText = x > 0 ? "Communal and Neutral" : "Individualistic and Neutral";
    } else if (x > 0 && y > 0) {
        quadrantText = "Communal and Change-Seeking";
    } else if (x > 0 && y < 0) {
        quadrantText = "Communal and Change-Averse";
    } else if (x < 0 && y > 0) {
        quadrantText = "Individualistic and Change-Seeking";
    } else if (x < 0 && y < 0) {
        quadrantText = "Individualistic and Change-Averse";
    }

    if (x === 0 || y === 0) {
        const axisLabel = determineAxisLabel(x, y);
        quadrantText += ` (${axisLabel})`;
    }

    document.getElementById('result').textContent = `The paragraph is: ${quadrantText}`;
}

function determineSegment(x, y) {
    const distance = Math.sqrt(x * x + y * y);
    let ring, axis;

    if (distance <= 0.33) {
        ring = "inner";
    } else if (distance <= 0.66) {
        ring = "middle";
    } else {
        ring = "outer";
    }

    if (x > 0 && y > 0) {
        axis = "top-right";
    } else if (x > 0 && y < 0) {
        axis = "bottom-right";
    } else if (x < 0 && y > 0) {
        axis = "top-left";
    } else {
        axis = "bottom-left";
    }

    return { ring, axis };
}

function displaySegmentLabel(x, y) {
    const { ring, axis } = determineSegment(x, y);
    let segment = null;
    let adjacentSegment = null;

    // Determine the segment based on the ring and axis
    if (ring === "inner") {
        if (axis === "top-right") {
            segment = "Stoker";
        } else if (axis === "bottom-right") {
            segment = "Prepper";
        } else if (axis === "top-left") {
            segment = "Sparker";
        } else {
            segment = "Burn Manager";
        }
    } else if (ring === "middle") {
        if (axis === "top-right") {
            segment = "Illuminator";
        } else if (axis === "bottom-right") {
            segment = "Tinder Gatherer";
        } else if (axis === "top-left") {
            segment = "Accelerant";
        } else {
            segment = "De-oxygenator";
        }
    } else {
        if (axis === "top-right") {
            segment = "Torch Bearer";
        } else if (axis === "bottom-right") {
            segment = "Fire Chief";
        } else if (axis === "top-left") {
            segment = "Trailblazer";
        } else {
            segment = "Firefighter";
        }
    }

    // Handle axis case (e.g., when x or y is 0)
    if (x === 0 || y === 0) {
        adjacentSegment = determineAxisLabel(x, y);
        segment = null;
    }

    // Display the segment label if there is one
    if (segment || adjacentSegment) {
        const resultElement = document.getElementById('result');
        let existingText = resultElement.textContent;

        if (adjacentSegment && !existingText.includes(`(${adjacentSegment})`)) {
            resultElement.textContent += ` (${adjacentSegment})`;
        } else if (segment && !existingText.includes(`(${segment})`)) {
            resultElement.textContent += ` (${segment})`;
        }

        if (adjacentSegment) {
            const [firstSegment, secondSegment] = adjacentSegment.split('-');
            displaySegmentDefinition(firstSegment, secondSegment);
        } else if (segment) {
            displaySegmentDefinition(segment);
        }
    } else {
        document.getElementById('segment-definition').classList.add('hidden');
    }
}

function displaySegmentDefinition(segment, adjacentSegment = null) {
    const definitionContainer = document.getElementById('segment-definition');
    definitionContainer.innerHTML = '';  // Clear previous content

    if (segmentDefinitions[segment]) {
        let definitionHTML = `<h3>${segment}</h3><p>${segmentDefinitions[segment]}</p>`;

        if (adjacentSegment && segmentDefinitions[adjacentSegment]) {
            definitionHTML += `<h3>${adjacentSegment}</h3><p>${segmentDefinitions[adjacentSegment]}</p>`;
        }

        definitionContainer.innerHTML = definitionHTML;
        definitionContainer.classList.remove('hidden');
    } else {
        definitionContainer.classList.add('hidden');
    }
}

function determineAxisLabel(x, y) {
    let axisLabel = '';
    if (x === 0 && y > 0) {
        if (y <= 0.34) {
            axisLabel = 'Sparker-Stoker';
        } else if (y <= 0.67) {
            axisLabel = 'Accelerant-Illuminator';
        } else {
            axisLabel = 'Trailblazer-Torch Bearer';
        }
    } else if (x === 0 && y < 0) {
        if (Math.abs(y) <= 0.34) {
            axisLabel = 'Prepper-Burn Manager';
        } else if (Math.abs(y) <= 0.67) {
            axisLabel = 'Tinder Gatherer-De-oxygenator';
        } else {
            axisLabel = 'Fire Chief-Firefighter';
        }
    } else if (y === 0 && x > 0) {
        if (x <= 0.34) {
            axisLabel = 'Stoker-Prepper';
        } else if (x <= 0.67) {
            axisLabel = 'Illuminator-Fire Chief';
        } else {
            axisLabel = 'Torch Bearer-Fire Chief';
        }
    } else if (y === 0 && x < 0) {
        if (Math.abs(x) <= 0.34) {
            axisLabel = 'Sparker-Burn Manager';
        } else if (Math.abs(x) <= 0.67) {
            axisLabel = 'Accelerant-De-oxygenator';
        } else {
            axisLabel = 'Firefighter-Trailblazer';
        }
    }
    return axisLabel;
}

function updateChart(percentIndividualistic, percentCommunal, percentChangeSeeking, percentChangeAverse, countIndividualistic, countCommunal, countChangeSeeking, countChangeAverse) {
    const chartBody = document.getElementById('chart-body');
    chartBody.innerHTML = `
        <tr>
            <td>Individualistic</td>
            <td>${(percentIndividualistic * 100).toFixed(2)}%</td>
            <td>${countIndividualistic}</td>
        </tr>
        <tr>
            <td>Communal</td>
            <td>${(percentCommunal * 100).toFixed(2)}%</td>
            <td>${countCommunal}</td>
        </tr>
        <tr>
            <td>Change-Seeking</td>
            <td>${(percentChangeSeeking * 100).toFixed(2)}%</td>
            <td>${countChangeSeeking}</td>
        </tr>
        <tr>
            <td>Change-Averse</td>
            <td>${(percentChangeAverse * 100).toFixed(2)}%</td>
            <td>${countChangeAverse}</td>
    `;

    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer.querySelector('thead')) {
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Type</th>
                <th>Percentage</th>
                <th>Count</th>
            </tr>
        `;
        chartContainer.querySelector('table').prepend(thead);
    }
}