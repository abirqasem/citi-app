var db = SpreadsheetApp.openById('12XalDsVyVu19p0EL6E552P8anzeJx8-tgG6oXjgOREE');




function doGet(e) {
  
  var template;
  var title_string="";
 
      
  template = HtmlService.createTemplateFromFile('ui') // defaults if no query parameter
  title_string='USA';
    
  
  return template.evaluate()
      .setTitle(title_string).setSandboxMode(HtmlService.SandboxMode.IFRAME);
}


//
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//               佛祖保佑         永无BUG
//





function get_initial_ui(screen_id){
  var ui={};
   var content_html=""
   
   var content_html=content_html+"<div id='header_area'>"+HtmlService.createTemplateFromFile("header_ui").evaluate().getContent()+"</div>";
   ui["header_html"]=content_html;
   
  if(screen_id===0){   
   
   ui["body_html"]="<div id='body_area'>"+HtmlService.createTemplateFromFile("body_ui").evaluate().getContent()+"</div>";

  }
  
  if (screen_id===1){
     var template;
  var title_string="";
 
      
  template = "<div id='body_area'>"+HtmlService.createTemplateFromFile('ui').evaluate().getContent()+"</div>"; // defaults if no query parameter
  title_string='<h1>USA</h1>';
    ui["body_html"] = template


    
  }

  return ui
  

}

function include() {
  
  var con='';
  
  for (var i=0;i<arguments.length;i++)
  {
    con=con+HtmlService.createHtmlOutputFromFile(arguments[i]).getContent();
    
  }

 return con;
}


function voice_match (response, row_num) {
 
  var ss = db.getSheetByName('keys');
  var max_col = ss.getDataRange().getLastColumn();
  var keys =ss.getRange(row_num, 2, 1, max_col).getValues();
  
  /*
  The first version of match based on voice recognition (VR). 
  Many of the civics questions have several right answers. We make an universal key that contains all the answers
  Then we check if the VR response is contained in the uiversal key. The main problem is saying too little will allow you to fool the system
  */
  var universal_key = "" 
  
  for (var i in keys[0]) {
   universal_key+= keys[0][i] 
  }
  
  
  
  if (basic_match (response, universal_key)){
    return {match:true, feedback:""}
    
  }
  else 
  {
    return {match:false, feedback:universal_key}
  }
  
  
}






/*

Produces an MCQ item with the question, options, the right answer number among the options 
and the row number where it was retrieved from. The row number may be superfluous but it does not hurt to store the information

If the row number is 0. The function returns null. This is useful in determining the end of an MCQ practice session. 
The caller sends 0 when there is no more rows to choose from.

*/

function getQuizItem (sheet_name, n) {
  
  var q_item;
  if (n >0){
    var ss = db.getSheetByName(sheet_name);
    var cols= ss.getDataRange().getNumColumns();
    var row = ss.getRange(n, 1, 1,5)
   
    var mcq_entries =row.getValues()[0];
    var ans_pos  = ss.getRange(n, 6, 1,1).getValue()-1;
    
   
    
    mcq_entries[ans_pos] = format_ans(mcq_entries[0], mcq_entries[ans_pos])
    
    q_item = {options:mcq_entries, ans_pos:ans_pos, row_num:n}; 
    
  }
  else {
    q_item =null;
    
  }
  Logger.log(q_item);
  
  return q_item;

  
}


/* 

 Formats the correct answer so that it looks nice in MCQ. If the question asks for 2 or 3 items say two secretaries etc. then it actually makes
 a two item option. 


*/


function format_ans (q,a) {
 
  
  
 
  
  var choose=1;
  if (q.toLowerCase().indexOf ("two") >0){
    choose=2
  }
  if (q.toLowerCase().indexOf ("three") >0 ){
    choose=3
  }
  
  //var next =  Math.floor(Math.random() * (choose)) ; 
  var formatted ="";
  
  
  var all_items =a.split(';');
  var items =[];
  for (var i in all_items) {
    if (all_items[i].trim().length >0) 
      items.push(all_items[i])
  }
  
 
   
  function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
      return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
  }
  
  for (var i=0; i<choose && i<items.length;i++){
    
    formatted+=String(items[i].trim()) + " "; 
    
  }
  
  
  return formatted;
    
    
}
  

function contains (s1,s2) {
  var clean_s1 = String(s1).toLowerCase();
  var clean_s2 = String(s2).toLowerCase();
  if (clean_s2.trim().length ==0) return false;
  if (clean_s1.trim().length ==0) return false;
  
  
  return (clean_s1.indexOf (clean_s2) >=0 || clean_s2.indexOf (clean_s1) >=0) 
  
  
}



/* Various util functions - ignore and delete from final code **************************************/


function genMCQ (sheet_name)  {
 
  var ss = db.getSheetByName(sheet_name); 
  if (!ss) {
    ss =db.insertSheet(sheet_name);
    
  }
  
  /* 
  
  go through the keys
  get the q - put in q
  get the key or its variation make ; sepreted field
  random and put in 
  */

  
  
  var data_range = db.getSheetByName('keys').getDataRange()
  var mcq_keys = data_range.getValues();
  var cols = data_range.getNumColumns()
  
  var exam = [];
  
  for (var item in mcq_keys) {
    var q = [];
    q.push(mcq_keys[item][0]);
    q[1]="";
    q[2]="";
    q[3]="";
    q[4]="";
    var ans = Math.floor(Math.random() * 4) + 1;
    q[ans]=mcq_keys[item].slice(1,cols).join (";");
    
    /* Crazy choices */
    
    q[1] = q[1]=="" ? get_false (Number(item+1)):q[1];
    q[2] = q[2]=="" ? get_false (Number(item+1)):q[2];
    q[3] = q[3]=="" ? get_false (Number(item+1)):q[3];
    q[4] = q[4]=="" ? get_false (Number(item+1)):q[4];
    exam.push(q)
    
  }
  
  
  
  
  ss.getRange(1, 1, 100, 5).setValues(exam)
  
   
  
}

  









function misc_test () {




  
// var el =DocumentApp.openById("1Gh4c8wNi19LA8msPP38U2kuFDO3ln2thDDumMMOOZOQ").getBody().getTables()[0].getCell(1, 0);
// Logger.log(el.getText());
//  
// Logger.log(el.asText().getTextAttributeIndices());
//  
  
  
  
}







