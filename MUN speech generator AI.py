from ollama import chat
from ollama import ChatResponse
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)



@app.route('/', methods=['GET','POST'])
def home():
    return render_template('index.html')

@app.route('/generate', methods = ['POST'])
def generate():
        data=request.get_json()
        committee=data.get('committee','')
        portfolio=data.get('portfolio','')
        agenda=data.get('agenda','')
        tl=data.get('time_limit','')
        cx=data.get('context','')
        input=(f"Make a Model United Nations speech of the committee {committee} for the delegate of {portfolio} on the agenda {agenda} with a time limit of {tl} seconds. Keep the tone formal. Make it with structure: 1. Hook 2. Delegate's Stance 3.Solutions 4. Call to Action 5. Memorable closing line. Also attack the countries that are criminals for the agenda (the countries whose activities related to this agenda are questionable) but only if they are not our country's allies. Make the speech strong, different from others. Make it according to 130 WPM average speaking pace. DO NOT USE PERSONAL PRONOUNS except 'WE' and 'OUR'. Include specifics like names of incidents, treaties, assemblies etc. Additional information (if any) is {cx}. After the speech, provide 5 possible questions opposers can ask along with their most diplomatic answers.")
        try:
            response: ChatResponse = chat(model='llama3.2', messages=[
            {
            'role':'user',
            'content':input}
            ])
            return jsonify({
                 'speech': response['message']['content'],
                'committee': committee,
                'portfolio': portfolio,
                'agenda': agenda,
                'time_limit': tl,
                'context': cx,
            })
        except Exception as e:
             return jsonify({'error':str(e)}), 500
     

if __name__ == '__main__':
    app.run(debug=True)