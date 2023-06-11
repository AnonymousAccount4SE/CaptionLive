export function parseTaskType(type) {
  switch(type) {
    case 'TIMELINE':
      return '时轴'
    
    case 'TRANSLATION':
      return '翻译'
    
    case 'CHECK':
      return '校对'
    
    default:
      return '';
  }
}

export function parseTaskTypeInitial(type) {
  switch(type) {
    case 'TIMELINE':
      return '轴'
    
    case 'TRANSLATION':
      return '翻'
    
    case 'CHECK':
      return '校'
    
    default:
      return '';
  }
}

export function parseTaskStatus(status) {
  switch(status) {
    case 'NOT_ASSIGNED':
      return '#ff6765'

    case 'IN_PROGRESS':
      return '#7fb9d8'
    
    default:
      return '';
  }
}

export function parseScope(scope) {
  const colonIndex = scope.indexOf(':');
  const startTime = scope.substring(0, colonIndex);
  const endTime = scope.substring(colonIndex + 1);

  console.log(startTime);
  console.log(endTime);

  return parseTime(startTime) + ' - ' + parseTime(endTime);
}

function parseTime(time) {
  const intTime = parseInt(time);
  let parsed = (time % 60).toString();

  if (intTime > 60) {
    parsed = (time / 60).toString() + ':' + parsed;
  }

  if (intTime > 3600) {
    parsed = (time / 3600).toString() + ':' + parsed;
  }
  return parsed;
}