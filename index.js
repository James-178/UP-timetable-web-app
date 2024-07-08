// let tbody = document.getElementById("tbody");
// tbody.innerHTML = "";
// for (let i = 7; i < 18; i++) {
//     let tr = document.createElement("tr");
//     let th = document.createElement("th");
//     th.innerHTML = i + ":30";
//     tr.appendChild(th);
//     for (let j = 0; j < 5; j++) {
//         let td = document.createElement("td");
//         tr.appendChild(td);
//     }
//     tbody.appendChild(tr);    
// }

// Mock data
const colours = ["red", "black", "orange", "HotPink", "purple", "green", "blue", "turquoise", "teal", "lime", "#eb5e34"];
const modalO = document.getElementById("modalOverlay");
modalO.addEventListener('click', (event) => {
    if (event.target === modalO) {
        modalO.style.display = "none";
        modalO.innerHTML = "";
    }
});

const modalE = document.getElementById("editOverlay");
modalE.addEventListener('click', (event) => {
    if (event.target === modalE) {
        modalE.style.display = "none";
        //modalE.innerHTML = "";
    }
});
  
  // Function to generate timetable rows
function generateTimetable() {
    const timetableBody = document.getElementById('timetable-body');
    timetableBody.innerHTML = "";
    const rows = [];
    const startInp = document.getElementById("start-input");
    const endInp = document.getElementById("end-input");
    for (let i = 7.5; i <= 18.5; i += 0.5) {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        let time = i.toFixed(2); // Convert the number to a string with 2 decimal places
        if (time.endsWith('.50')) { // Check if the time ends with .5
            time = time.replace('.50', ':30'); // Replace .5 with :30
        } else {
            time = time.replace('.00', ':00'); // Replace .0 with :00
        }

        if(time.startsWith('7') || time.startsWith('8') || time.startsWith('9')){
            time = '0' + time;
        }

        if(i != 18.5){
            const startOption = document.createElement("option");
            startOption.innerHTML = time;
            startOption.value = time;
            startInp.appendChild(startOption);
        }

        if(i != 7.5){
            const endOption = document.createElement("option");
            endOption.innerHTML = time;
            endOption.value = time;
            endInp.appendChild(endOption);
        }

        timeCell.textContent = `${time}`;
        timeCell.style.width = "8%";
        row.appendChild(timeCell);

        for (let j = 0; j < 5; j++) { // Monday to Friday
            const cell = document.createElement('td');
            cell.className = 'cell';
            row.appendChild(cell);
        }
        rows.push(row);
    }

    timetableBody.innerHTML = '';
    rows.forEach((row) => timetableBody.appendChild(row));
}

function addClickListenerOnce(element, callback) {
    if (!element._clickListenerAdded) {
        element.addEventListener("click", callback);
        element._clickListenerAdded = true;
    }
}

// Function to render lessons on the timetable
let removed = [];
let filled = [];
function renderLessons(allLessons) {
    const cells = document.querySelectorAll('#timetable-body .cell');
    console.log(cells);
    console.log(allLessons);
    allLessons.forEach((lesson) => {
        
        const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(lesson.day);
        const startTime = lesson.start.split(':');
        const startHour = parseInt(startTime[0]);
        const startMin = parseInt(startTime[1]);
        const endTime = lesson.end.split(':');
        const endHour = parseInt(endTime[0]);
        const endMin = parseInt(endTime[1]);
        const durationHours = endHour - startHour;
        const durationMins = endMin - startMin;
        //console.log(startMin);
        let cellInd;
        let check;
        if(startMin == 0){
            cellInd = dayIndex + 10*(startHour - 7) - 5 ;
            check = true;
        }else{
            cellInd = dayIndex + 10*(startHour - 7);
            check = false;
        }

        if(startMin == 0 && (endMin != 0 || endMin == 0)){
            check = false;
        }
        //const cell = cells[cellInd];
        //console.log(cell);
        //console.log("check: " + check);
        let cell;
        let finalCellInd;
        let collision;
        if(!removed.includes(cellInd) && !filled.includes(cellInd)){
            cell = cells[cellInd];    
            collision = false;
            filled.push(cellInd);
        }else{
            finalCellInd = cellInd;
            while(removed.includes(finalCellInd)){
                finalCellInd -= 5;
            }
            collision = true;
            cell = cells[finalCellInd];
        }
        //console.log("collision: " + collision);

        const lessonElement = document.createElement('div');
        lessonElement.className = 'lesson';
        lessonElement.dataset.module = lesson.module;
        lessonElement.innerHTML = `
            ${lesson.activity.startsWith("L") ? "📖" : 
            lesson.activity.startsWith("P") ? "⚗️" : 
            lesson.activity.startsWith("O") ? "🏋️‍♂️":
            lesson.activity.startsWith("D") || lesson.activity.startsWith("B") ? "💬" : 
            lesson.activity.startsWith("T") ? "📚" : ""} ${lesson.activity} <br>
            📍${lesson.venue} <br>
            ⏰${lesson.start} - ${lesson.end}
        `;
        lessonElement.style.borderColor = colours[Math.floor(Math.random() * colours.length)];

        let cellsToMerge = Math.floor((durationHours * 2) + (durationMins / 60)) - 1;
        if(startMin == 0 && durationHours % 2 != 0){
            cellsToMerge = Math.round((durationHours * 2) + (durationMins / 60)) - 1;
        }
        if(collision){
            lessonElement.classList.add("overlap");
            lessonElement.style.top = `50px`;
            
        }
        // console.log("hours: " + durationHours);
        // console.log("mins: " + durationMins);
        // console.log("cells to merge: " + cellsToMerge);
        
        let k = cellInd + 5;
        let nextCell = cells[k]; 
        for (let i = 0; i < cellsToMerge; i++) {
            if(nextCell){
                if(!removed.includes(k) || collision == false ){
                    cell.rowSpan = cell.rowSpan + 1;
                    nextCell.remove();
                    if(!removed.includes(k)){
                        removed.push(k);
                    }
                    // console.log("k: " + k);
                }
                if(i == cellsToMerge -1 && !check){
                    k = cellInd + (i+1)*5;
                    
                    if(!removed.includes(k) ){
                        // console.log("k2: " + k);
                        if(collision){
                            cell.rowSpan = cell.rowSpan + 1;
                        }
                        nextCell = cells[k];
                        nextCell.remove();
                        removed.push(k);
                    }
                }
            }
            
            k = cellInd + (i+1)*5
            nextCell = cells[k];
        }
        // console.log(removed);
        
        const h = document.getElementById("time").offsetHeight;
        const rowHeight = 0.56 * (cellsToMerge + 1) * h + (cellsToMerge - 1)*17;
        lessonElement.style.height = `${rowHeight}px`;
        if(!collision){
            lessonElement.style.top = "7px";
        }else{
            lessonElement.style.top = `${((cellInd - finalCellInd)/5 + 1) * h - 31}px`;
        }

        addClickListenerOnce(cell, () => {
            const childDivs = cell.querySelectorAll('div');
            const copiedDivs = Array.from(childDivs).map(div => div.cloneNode(true));
            console.log(copiedDivs);
            const overlay = document.getElementById("modalOverlay");
            console.log(lesson);
            copiedDivs.forEach(d => {
                d.classList.remove("overlap");
                d.style.removeProperty("top");
                d.style.removeProperty("height");
                d.classList.add("lesson-overlay");
                d.addEventListener("click", () =>{
                    const editOverlay = document.getElementById("editOverlay");
                    editOverlay.style.display = 'flex';
                    
                    const moduleInp = document.getElementById("name-input");
                    const locationInp = document.getElementById("location-input");
                    const activityInp = document.getElementById("activity-input");
                    const dayInp = document.getElementById("day-input");
                    const startInp = document.getElementById("start-input");
                    const endInp = document.getElementById("end-input");

                    moduleInp.value = lesson.module;
                    locationInp.value = lesson.venue;
                    activityInp.value = lesson.activity;
                    dayInp.value = lesson.day;
                    startInp.value = lesson.start;
                    endInp.value = lesson.end;

                    const saveInp = document.getElementById("save-input");
                    saveInp.addEventListener("click", () =>{
                        
                    });
                });
                overlay.appendChild(d);
            });
            overlay.style.display = 'flex';
        });
        cell.appendChild(lessonElement);
        //console.log(cells);
    });
}
  
  // Initialize timetable
  generateTimetable();
  

let storedModules = JSON.parse(localStorage.getItem('storedModules'));

function halfHours(startTime, endTime){
    const startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
    const endMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
    const halfHours = (endMinutes - startMinutes) / 30;
    return halfHours;
}

function getIndex(day, s){
    const dayInd = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(day);
    const sTime = s.split(':');
    const startHour = parseInt(sTime[0]);
    const startMin = parseInt(sTime[1]);
    return (startMin == 0) ? (dayInd + 10*(startHour - 7) - 5) : (dayInd + 10*(startHour - 7));    
}

const lessons2 = [];
const lessons3D = [];
let arr = new Array(115).fill(0);

function incArr(a, startInd, number){
    for (let i = 0; i < number; i++) {
        a[startInd + i * 5]++;
    }
    return a;
}

// console.log(storedModules);
Object.keys(storedModules).forEach(moduleCode => {
    module = storedModules[moduleCode];
    // console.log(module);
    let lec = false;
    let prac = false;
    let tut = false;

    module.lectureGroups == 0 ? lec = true : lec = false;
    module.practicalGroups == 0 ? prac = true : prac = false;
    module.tutorialGroups == 0 ? tut = true : tut = false;

    if(module.lectureGroups == 1){
        lec = true;
        const lectures = module.groups.filter(group => group.activity.startsWith("L"));
        lectures.forEach(lecture => {
            const index = getIndex(lecture.day, lecture.start);
            const num = halfHours(lecture.start, lecture.end);
            arr = incArr(arr, index, num);
            const lesson = lecture;
            lesson.module = moduleCode;
            lessons2.push(lesson);
        });
    }

    if(module.practicalGroups == 1){
        prac = true;
        const practicals = module.groups.filter(group => group.activity.startsWith("P"));
        practicals.forEach(practical => {
            const index = getIndex(practical.day, practical.start);
            const num = halfHours(practical.start, practical.end);
            arr = incArr(arr, index, num);
            const lesson = practical;
            lesson.module = moduleCode;
            lessons2.push(lesson);
        });
    }

    if(module.tutorialGroups == 1){
        tut = true;
        const tutorials = module.groups.filter(group => group.activity.startsWith("T"));
        tutorials.forEach(tutorial => {
            const index = getIndex(tutorial.day, tutorial.start);
            const num = halfHours(tutorial.start, tutorial.end);
            arr = incArr(arr, index, num);
            const lesson = tutorial;
            lesson.module = moduleCode;
            lessons2.push(lesson);
        });
    }

    if(!lec && module.preferredLectureGroup != "Any"){
        lec = true;
        const lectures = module.groups.filter(group => group.group.startsWith(module.preferredLectureGroup));
        lectures.forEach(lecture => {
            const index = getIndex(lecture.day, lecture.start);
            const num = halfHours(lecture.start, lecture.end);
            arr = incArr(arr, index, num);
            const lesson = lecture;
            lesson.module = moduleCode;
            lessons2.push(lesson);
        });
    }

    if(!prac && module.preferredPracticalGroup != "Any"){
        prac = true;
        const practicals = module.groups.filter(group => group.group.startsWith(module.preferredPracticalGroup) && group.activity.startsWith("P"))
        .reduce((acc, current) => {
            const existingActivity = acc.find(activity => activity.activity === current.activity);
            if (!existingActivity) {
                acc.push(current);
            }
            return acc;
        }, []);
        practicals.forEach(practical => {
            const index = getIndex(practical.day, practical.start);
            const num = halfHours(practical.start, practical.end);
            arr = incArr(arr, index, num);
            const lesson = practical;
            lesson.module = moduleCode;
            lessons2.push(lesson);
        })
        
    }

    if(!tut && module.preferredTutorialGroup != "Any"){
        tut = true;
        const tutorials = module.groups.filter(group => group.group.startsWith(module.preferredTutorialGroup) && group.activity.startsWith("T"))
        .reduce((acc, current) => {
            const existingActivity = acc.find(activity => activity.activity === current.activity);
            if (!existingActivity) {
                acc.push(current);
            }
            return acc;
        }, []);
        tutorials.forEach(tutorial => {
            const index = getIndex(tutorial.day, tutorial.start);
            const num = halfHours(tutorial.start, tutorial.end);
            arr = incArr(arr, index, num);
            const lesson = tutorial;
            lesson.module = moduleCode;
            lessons2.push(lesson);
        });
        
    }

    const lecArr = [];
    if(!lec){
        const uniqueGroups = [...new Set(module.groups.map(group => group.group))];
        uniqueGroups.forEach(groupName => {
            const groupActivities = [];
            const existingActivities = {};
            module.groups.forEach(activity => {
                if (activity.group === groupName && (groupName.startsWith("G") || activity.activity.startsWith("L")) && !activity.activity.startsWith("P") && !activity.activity.startsWith("T")) {
                    const key = activity.activity;
                    if (!existingActivities[key]) {
                        existingActivities[key] = true;
                        activity.module = moduleCode;
                        groupActivities.push(activity);
                    }
                }
            });
            if(groupActivities.length !== 0){
                lecArr.push(groupActivities);
            }
        });
        // console.log("lecArr: ");
        // console.log(lecArr);
    }

    const pracArr = [];
    if(!prac){
        const uniqueGroups = [...new Set(module.groups.map(group => group.group))];
        uniqueGroups.forEach(groupName => {
            const groupActivities = [];
            const existingActivities = {};
            module.groups.forEach(activity => {
                if (activity.group === groupName && (groupName.startsWith("P") || activity.activity.startsWith("P"))) {
                    const key = activity.activity;
                    if (!existingActivities[key]) {
                        existingActivities[key] = true;
                        activity.module = moduleCode;
                        groupActivities.push(activity);
                    }
                }
            });
            if(groupActivities.length !== 0){
                pracArr.push(groupActivities);
            }
        });
        // console.log("pracArr: ");
        // console.log(pracArr);
    }

    const tutArr = [];
    if(!tut){
        const uniqueGroups = [...new Set(module.groups.map(group => group.group))];
        uniqueGroups.forEach(groupName => {
            const groupActivities = [];
            const existingActivities = {};
            module.groups.forEach(activity => {
                if (activity.group === groupName && (groupName.startsWith("T") || activity.activity.startsWith("T"))) {
                    const key = activity.activity;
                    if (!existingActivities[key]) {
                        existingActivities[key] = true;
                        activity.module = moduleCode;
                        groupActivities.push(activity);
                    }
                }
            });
            if(groupActivities.length !== 0){
                tutArr.push(groupActivities);
            }
        });
        // console.log("tut arr: ");
        // console.log(tutArr);
    }
    
    //create many timetables
    let arrOfArrs = [];
    let arrOfArrsCollitions = [];
    let arrOfLessons = [];

    if(lecArr.length !== 0){//lecture
        lecArr.forEach(lectureGroup => {
            let copiedArr = new Array(115).fill(0);
            let less = [];
            lectureGroup.forEach(lecture => {
                const index = getIndex(lecture.day, lecture.start);
                const num = halfHours(lecture.start, lecture.end);
                copiedArr = incArr(copiedArr, index, num);
                less.push(lecture);
            });
            
            if(pracArr.length !== 0){//lecture + prac
                pracArr.forEach(practicalGroup => {
                    let copiedArrPrac = [...copiedArr];
                    let lessPrac = [...less];
                    practicalGroup.forEach(practical => {
                        const index = getIndex(practical.day, practical.start);
                        const num = halfHours(practical.start, practical.end);
                        copiedArrPrac = incArr(copiedArrPrac, index, num);
                        lessPrac.push(practical);
                    });

                    if(tutArr.length !== 0){//lecture + prac + tut
                        tutArr.forEach(tutorialGroup => {
                            let copiedArrTut = [...copiedArrPrac];
                            let lessTut = [...lessPrac];
                            tutorialGroup.forEach(tutorial => {
                                const index = getIndex(tutorial.day, tutorial.start);
                                const num = halfHours(tutorial.start, tutorial.end);
                                copiedArrTut = incArr(copiedArrTut, index, num);
                                lessTut.push(tutorial);
                            })
                            arrOfLessons.push(lessTut);
                            arrOfArrs.push(copiedArrTut);
                        });
                    }else{//lecture + prac + no tut
                        arrOfLessons.push(lessPrac);
                        arrOfArrs.push(copiedArrPrac);
                    }
                });
            }else if(tutArr.length !== 0){//lecture + no prac + tut
                tutArr.forEach(tutorialGroup => {
                    let copiedArrTut = [...copiedArrPrac];
                    let lessTut = [...lessPrac];
                    tutorialGroup.forEach(tutorial => {
                        const index = getIndex(tutorial.day, tutorial.start);
                        const num = halfHours(tutorial.start, tutorial.end);
                        copiedArrTut = incArr(copiedArrTut, index, num);
                        lessTut.push(tutorial);
                    })
                    arrOfLessons.push(lessTut);
                    arrOfArrs.push(copiedArrTut);
                }); 
            }else{//lecture + no prac + no tut
                arrOfLessons.push(less);
                arrOfArrs.push(copiedArr);
            }
        });
    }else if(pracArr.length !== 0){//no lecture + prac
        pracArr.forEach(practicalGroup => {
            let copiedArrPrac = new Array(115).fill(0);
            let lessPrac = [];
            practicalGroup.forEach(practical => {
                const index = getIndex(practical.day, practical.start);
                const num = halfHours(practical.start, practical.end);
                copiedArrPrac = incArr(copiedArrPrac, index, num);
                lessPrac.push(practical);
            });

            if(tutArr.length !== 0){//no lecture + prac + tut
                tutArr.forEach(tutorialGroup => {
                    let copiedArrTut = [...copiedArrPrac];
                    let lessTut = [...lessPrac];
                    tutorialGroup.forEach(tutorial => {
                        const index = getIndex(tutorial.day, tutorial.start);
                        const num = halfHours(tutorial.start, tutorial.end);
                        copiedArrTut = incArr(copiedArrTut, index, num);
                        lessTut.push(tutorial);
                    })
                    arrOfLessons.push(lessTut);
                    arrOfArrs.push(copiedArrTut);
                });
            }else{//no lecture + prac + no tut
                arrOfLessons.push(lessPrac);
                arrOfArrs.push(copiedArrPrac);
            }
        });
    }else if(tutArr.length !== 0){//no lecture + no prac + tut
        tutArr.forEach(tutorialGroup => {
            let copiedArrTut = new Array(115).fill(0);
            let lessTut = [];
            tutorialGroup.forEach(tutorial => {
                const index = getIndex(tutorial.day, tutorial.start);
                const num = halfHours(tutorial.start, tutorial.end);
                copiedArrTut = incArr(copiedArrTut, index, num);
                lessTut.push(tutorial);
            })
            arrOfLessons.push(lessTut);
            arrOfArrs.push(copiedArrTut);
        });
    }

    // console.log("Array of lessons: ");
    // console.log(arrOfLessons);
    // console.log(arrOfArrs);
    if(arrOfLessons.length !==0){
        lessons3D.push(arrOfLessons);
    }
    
    // console.log(lessons3D);
});

let s = 1;
if(lessons3D.length > 0){
    lessons3D.forEach(mod =>{
        s *= mod.length;
        // console.log("length: "+ mod.length);
    });
    // console.log("s: "+ s);
}

let lesson3 = [...lessons2];
const allTimetables = new Array(s).fill(null).map(() => [...lesson3]);
if(lessons3D.length > 0){
    lessons3D.forEach(modulesIn3D=>{
        let itt = s/modulesIn3D.length;
        // console.log(itt);
        
        for (let i = 0; i < s; i += modulesIn3D.length) {
            let ind = 0;
            modulesIn3D.forEach(lessonGroup=>{
                lessonGroup.forEach(l =>{s
                    allTimetables[i + ind].push(l);
                });
                // console.log(i+ind);
                ind++; 
                
            });
            //console.log("i: "+ i);
            // console.log(ind);
        }
    });
}
// console.log(allTimetables);
// console.log(arr);
lessons2.sort((a, b) => {
    const startA = a.start;
    const startB = b.start;
    return startA.localeCompare(startB);
});
allTimetables[0].sort((a, b) => {
    const startA = a.start;
    const startB = b.start;
    return startA.localeCompare(startB);
});

// console.log(lessons2);

renderLessons(allTimetables[0]);


