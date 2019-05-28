export default class SummaryManager {
  constructor(placeholder, template) {
    this.placeholder = placeholder;
    this.template = template;
    this.basePath = window.location.pathname.split('/').filter(part => !part.includes('.html')).join('/');

    this.config = {
      params: {
        items: []
      }
    };

    this.setConfig();
    this.render();
  }

  setConfig() {
    // Filter out only session storage keys for this prototype
    const keys = Object.keys(sessionStorage).filter(key => key.toLowerCase().includes(this.basePath));

    // Filter out questions with no answers and map questions
    const unsortedQuestions = keys.filter(key => {
      const data = JSON.parse(sessionStorage.getItem(key));
      const inputs = data.inputs.filter(input => input.label);
      return inputs.length;
    }).map(key => ({ key, ...JSON.parse(sessionStorage.getItem(key)) }));


    const firstQuestion = unsortedQuestions.find(question => !question.previousURL);
    const remainingUnsortedQuestions = unsortedQuestions.filter(question => question.previousURL).length;

    const questions = [firstQuestion];
  
    for (let i = 0; i < remainingUnsortedQuestions; i++) {
      const lastQuestionKey = questions[questions.length - 1].key;

      const nextQuestion = unsortedQuestions.find(question => question.previousURL === lastQuestionKey);

      questions.push(nextQuestion);
    }

    questions.forEach(question => {
      const answers = question.inputs.filter(input => input.label && input.value).map(input => input.value === true ? input.label : input.value);
      let joinString;

      if (answers.length > 3 ||  question.inputs.find(input => input.value === true)) {
        joinString = '<br>';
      } else {
        joinString = ' ';
      }

      let answer = answers.join(joinString);

      if (!answer) {
        answer = 'No answer provided';
      }
      
      const item = {
        questions: [
          {
            question: question.title,
            answer,
            action: {
              text: 'Change',
              ariaLabel: 'Change answer',
              url: question.key
            }
          }]
      };

      this.config.params.items.push(item);
    });
  }

  render() {
    const html = this.template.render(this.config);

    this.placeholder.innerHTML = html;
  }
}
