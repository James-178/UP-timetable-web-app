fetch('TUKS_Modules.json')
  .then(response => response.json())
  .then(data => {
    var modules = data.reduce((acc, current) => {
      const moduleCode = current.Module;
      if (!acc[moduleCode]) {
        acc[moduleCode] = {
          code: moduleCode,
          offered: current.Offered,
          groups: [],
        };
      }
      const group = current.Group;
      const activity = current.Activity;
      const day = current.Day;
      const start = current.Start;
      const end = current.End;
      const venue = current.Venue;
      const campus = current.Campus;

      acc[moduleCode].groups.push({
        group,
        activity,
        day,
        start,
        end,
        venue,
        campus,
      });

      return acc;
    }, {});

    console.log(modules);
    const moduleSearchInput = document.getElementById('module-search');
    const moduleOptions = document.getElementById('module-options');
    const selectedModulesDiv = document.getElementById('selected-modules');
    const selectedSem = document.getElementById('semester');
    
    moduleOptions.style.display = "none";
    
    moduleSearchInput.addEventListener('input', () => {
      const userInput = moduleSearchInput.value.toUpperCase();
      const selectedSemester = document.getElementById('semester').value;
      
      const filteredModules = Object.keys(modules).filter(moduleCode => {
        const moduleData = modules[moduleCode];
        const offered = moduleData.offered;
        const searchString = moduleCode.includes(userInput);
        if (selectedSemester === 'semester-1') {
          return (offered === 'S1' || offered === 'Q1' || offered === 'Q2' || offered === 'Y') && searchString;
        } else if (selectedSemester === 'semester-2') {
          return (offered === 'S2' || offered === 'Q3' || offered === 'Q4' || offered === 'Y') && searchString;
        }
      });
      const optionsHTML = filteredModules.map(moduleCode => `<option value="${moduleCode}">${moduleCode}</option>`).join('');
      moduleOptions.style.display = "block";
      if (userInput === '' || optionsHTML === "") { // check if search input is empty
        moduleOptions.innerHTML = ''; // clear options if empty
        moduleOptions.style.display = "none";
      } else {
        moduleOptions.innerHTML = optionsHTML;
      }
    });
    let selectedModules = [];
    let storedModules = {};
    localStorage.setItem("storedModules", JSON.stringify(storedModules));
    console.log(JSON.parse(localStorage.getItem("storedModules")));

    selectedSem.addEventListener('change', () => {
      selectedModules = [];
      storedModules = {};
      selectedModulesDiv.innerHTML = '';
      moduleSearchInput.value = '';
      moduleOptions.innerHTML = '';
      moduleOptions.style.display = "none";
    });

    moduleOptions.addEventListener('click', (event) => {
      const selectedModule = event.target.value;
      if (!selectedModules.includes(selectedModule)) {
        //stroing module
        if (!storedModules[selectedModule]) {
          storedModules[selectedModule] = {
            module : selectedModule,
            groups: [],
            preferredLectureGroup: "",
            preferredTutorialGroup: "",
            preferredPracticalGroup: "",
            lectureGroups: 0,
            tutorialGroups: 0,
            practicalGroups: 0 
          };
        }

        const moduleContainer = document.createElement('div');
        moduleContainer.className = 'module-container';

        const moduleCode = document.createElement('h4');
        moduleCode.textContent = selectedModule;

        //remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
          moduleContainer.remove();
          selectedModules = selectedModules.filter(module => module !== selectedModule);
          delete storedModules[selectedModule];
        });

        const semesterInfo = document.createElement('p');
        semesterInfo.textContent = `Semester: ${modules[selectedModule].offered}`;
        const loc = document.createElement('select');
        loc.textContent = 'Location:';

        const campuses = [...new Set(modules[selectedModule].groups.map((group) => group.campus))];

        campuses.forEach((campus) => {
          const option = document.createElement('option');
          option.value = campus;
          option.textContent = campus;
          loc.appendChild(option);
        });

        //change location
        loc.addEventListener('change', () => {
          const selectedCampus = loc.options[loc.selectedIndex].value;

          //filter groups
          const lectureGroups = modules[selectedModule].groups.filter((group) => group.activity.startsWith('L') && group.campus === selectedCampus)
            .reduce((uniqueGroups, currentGroup) => {
              if (!uniqueGroups.find((group) => group.group === currentGroup.group)) {
                uniqueGroups.push(currentGroup);
              }
              return uniqueGroups;
            }, []);

          //filter tuts  
          const tutorialGroups = modules[selectedModule].groups.filter((group) => group.activity.startsWith('T') && group.campus === selectedCampus)
            .reduce((uniqueGroups, currentGroup) => {
              if (!uniqueGroups.find((group) => group.group === currentGroup.group)) {
                uniqueGroups.push(currentGroup);
              }
              return uniqueGroups;
            }, []);
          
          //filter pracs
          const practicalGroups = modules[selectedModule].groups.filter((group) => group.activity.startsWith('P') && group.campus === selectedCampus)
            .reduce((uniqueGroups, currentGroup) => {
              if (!uniqueGroups.find((group) => group.group === currentGroup.group)) {
                uniqueGroups.push(currentGroup);
              }
              return uniqueGroups;
            }, []);

          
          lectureSelect.innerHTML = '';
          tutorialSelect.innerHTML = '';
          practicalSelect.innerHTML = '';

          const anyOption = document.createElement('option');
          anyOption.value = 'Any';
          anyOption.textContent = 'Any Group';

          if (lectureGroups.length !== 0) {
            lectureSelect.appendChild(anyOption);
          }
          if (tutorialGroups.length !== 0) {
            tutorialSelect.appendChild(anyOption.cloneNode(true));
          }
          if (practicalGroups.length !== 0) {
            practicalSelect.appendChild(anyOption.cloneNode(true));
          }

          lectureGroups.forEach((group) => {
            const option = document.createElement('option');
            option.value = group.group;
            option.textContent = group.group;
            lectureSelect.appendChild(option);
          });

          tutorialGroups.forEach((group) => {
            const option = document.createElement('option');
            option.value = group.group;
            option.textContent = group.group;
            tutorialSelect.appendChild(option);
          });

          practicalGroups.forEach((group) => {
            const option = document.createElement('option');
            option.value = group.group;
            option.textContent = group.group;
            practicalSelect.appendChild(option);
          });

          if (!storedModules[selectedModule]) {
            storedModules[selectedModule] = {
              module : selectedModule,
              groups: [],
              preferredLectureGroup: "",
              preferredTutorialGroup: "",
              preferredPracticalGroup: "",
              lectureGroups: 0,
              tutorialGroups: 0,
              practicalGroups: 0
            };
          }
  
          storedModules[selectedModule].groups = modules[selectedModule].groups.filter((group) => group.campus === selectedCampus);
          storedModules[selectedModule].preferredLectureGroup = (lectureGroups.length !== 0) ? lectureSelect.options[lectureSelect.selectedIndex].value : "";
          storedModules[selectedModule].preferredPracticalGroup = (practicalGroups.length !== 0) ? practicalSelect.options[practicalSelect.selectedIndex].value : "";
          storedModules[selectedModule].preferredTutorialGroup = (tutorialGroups.length !== 0) ? tutorialSelect.options[tutorialSelect.selectedIndex].value : "";

          storedModules[selectedModule].lectureGroups = lectureGroups.length;
          storedModules[selectedModule].tutorialGroups = tutorialGroups.length;
          storedModules[selectedModule].practicalGroups = practicalGroups.length;

          localStorage.setItem("storedModules", JSON.stringify(storedModules));
          console.log(JSON.parse(localStorage.getItem("storedModules")));
        });//end change location

        const selectedCampus = loc.options[loc.selectedIndex].value;

        //filter groups
        const lectureGroups = modules[selectedModule].groups.filter((group) => group.activity.startsWith('L') && group.campus === selectedCampus)
          .reduce((uniqueGroups, currentGroup) => {
            if (!uniqueGroups.find((group) => group.group === currentGroup.group)) {
              uniqueGroups.push(currentGroup);
            }
            return uniqueGroups;
          }, []);

        //filter tus
        const tutorialGroups = modules[selectedModule].groups.filter((group) => group.activity.startsWith('T') && group.campus === selectedCampus)
          .reduce((uniqueGroups, currentGroup) => {
            if (!uniqueGroups.find((group) => group.group === currentGroup.group)) {
              uniqueGroups.push(currentGroup);
            }
            return uniqueGroups;
          }, []);

        //filter practicals
        const practicalGroups = modules[selectedModule].groups.filter((group) => group.activity.startsWith('P') && group.campus === selectedCampus)
          .reduce((uniqueGroups, currentGroup) => {
            if (!uniqueGroups.find((group) => group.group === currentGroup.group)) {
              uniqueGroups.push(currentGroup);
            }
            return uniqueGroups;
          }, []);
        
        //Any Group option
        const anyOption = document.createElement('option');
        anyOption.value = 'Any';
        anyOption.textContent = 'Any Group';
        
        //lecture initial
        const lectureLabel = document.createElement('label');
        lectureLabel.textContent = 'Lecture Group:';

        const lectureSelect = document.createElement('select');
        //lectureSelect.id = 'lecture-select:';

        if (lectureGroups.length !== 0) {
          lectureSelect.appendChild(anyOption);
        }
        lectureGroups.forEach((group) => {
          const option = document.createElement('option');
          option.value = group.group;
          option.textContent = group.group;
          lectureSelect.appendChild(option);
        });
        
        lectureSelect.addEventListener('change', () => {
          storedModules[selectedModule].preferredLectureGroup = (lectureGroups.length !== 0) ? lectureSelect.options[lectureSelect.selectedIndex].value : "";
          localStorage.setItem("storedModules", JSON.stringify(storedModules));
          console.log(JSON.parse(localStorage.getItem("storedModules")));
        });

        //tutorial initial
        const tutorialLabel = document.createElement('label');
        tutorialLabel.textContent = 'Tutorial Group:';

        const tutorialSelect = document.createElement('select');
        //tutorialSelect.id = 'tutorial-select:';

        if (tutorialGroups.length !== 0) {
          tutorialSelect.appendChild(anyOption.cloneNode(true));
        }

        tutorialGroups.forEach((group) => {
          const option = document.createElement('option');
          option.value = group.group;
          option.textContent = group.group;
          tutorialSelect.appendChild(option);
        });

        tutorialSelect.addEventListener('change', () => {
          storedModules[selectedModule].preferredTutorialGroup = (tutorialGroups.length !== 0) ? tutorialSelect.options[tutorialSelect.selectedIndex].value : "";
          localStorage.setItem("storedModules", JSON.stringify(storedModules));
          console.log(JSON.parse(localStorage.getItem("storedModules")));
        });

        //practical initial
        const practicalLabel = document.createElement('label');
        practicalLabel.textContent = 'Practical Group:';
        
        const practicalSelect = document.createElement('select');
        practicalSelect.textContent = 'Practical Group:';

        if (practicalGroups.length !== 0) {
          practicalSelect.appendChild(anyOption.cloneNode(true));
        }

        practicalGroups.forEach((group) => {
          const option = document.createElement('option');
          option.value = group.group;
          option.textContent = group.group;
          practicalSelect.appendChild(option);
        });

        practicalSelect.addEventListener('change', ()=> {
          storedModules[selectedModule].preferredPracticalGroup = (practicalGroups.length !== 0) ? practicalSelect.options[practicalSelect.selectedIndex].value : "";
          localStorage.setItem("storedModules", JSON.stringify(storedModules));
          console.log(JSON.parse(localStorage.getItem("storedModules")));
        });

        storedModules[selectedModule].groups = modules[selectedModule].groups.filter((group) => group.campus === selectedCampus);
        storedModules[selectedModule].preferredLectureGroup = (lectureGroups.length !== 0) ? lectureSelect.options[lectureSelect.selectedIndex].value : "";
        storedModules[selectedModule].preferredPracticalGroup = (practicalGroups.length !== 0) ? practicalSelect.options[practicalSelect.selectedIndex].value : "";
        storedModules[selectedModule].preferredTutorialGroup = (tutorialGroups.length !== 0) ? tutorialSelect.options[tutorialSelect.selectedIndex].value : "";

        storedModules[selectedModule].lectureGroups = lectureGroups.length;
        storedModules[selectedModule].tutorialGroups = tutorialGroups.length;
        storedModules[selectedModule].practicalGroups = practicalGroups.length;

        localStorage.setItem("storedModules", JSON.stringify(storedModules));
        console.log(JSON.parse(localStorage.getItem("storedModules")));
        //adding elements to html
        moduleContainer.appendChild(moduleCode);
        moduleContainer.appendChild(removeButton);
        moduleContainer.appendChild(semesterInfo);

        moduleContainer.appendChild(loc);
        moduleContainer.appendChild(document.createElement("br"));
        moduleContainer.appendChild(lectureLabel);
        moduleContainer.appendChild(lectureSelect);
        moduleContainer.appendChild(document.createElement("br"));
        moduleContainer.appendChild(practicalLabel);
        moduleContainer.appendChild(practicalSelect);
        moduleContainer.appendChild(document.createElement("br"));
        moduleContainer.appendChild(tutorialLabel);
        moduleContainer.appendChild(tutorialSelect);

        selectedModulesDiv.appendChild(moduleContainer);
        selectedModules.push(selectedModule);
        
        //display banner
        const banner = document.createElement('div');
        banner.className = 'notification-banner';
        banner.textContent = `Module ${selectedModule} added successfully`;
        document.body.appendChild(banner);

        setTimeout(() => {
          banner.remove();
        }, 2000);
        console.log(selectedModules);
      }else{
        const banner = document.createElement('div');
        banner.className = 'notification-banner';
        banner.textContent = `Module ${selectedModule} already added`;
        document.body.appendChild(banner);

        // Hide the banner after a few seconds
        setTimeout(() => {
          banner.remove();
        }, 2000);
      }
    });

    let generate = document.getElementById("generate-timetable");
    generate.addEventListener('click', () =>{
      window.location.href = "index.html";
    });
  });

