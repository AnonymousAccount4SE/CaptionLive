import React from 'react';
import { useSelector, useDispatch } from 'react-redux'

import TaskStatusIcon from '../InfoCard/TaskStatusIcon';
import { openUploaderWindow, updateCurrentIdToUpload, updateCurrentUploadType } from '../../redux/fileSlice';
import { openSegment, closeSegment } from '../../redux/layoutSlice';
import { useAssignTaskMutation, useWithdrawTaskMutation, useAssignFileToTaskMutation, useDeleteSegmentMutation } from '../../services/organization';
import { parseTaskType, parseScope } from '../../utils/segment';
import { Icon } from '@rsuite/icons';
import { FaAngleUp, FaAngleDown, FaTrash } from 'react-icons/fa';
import FileUploader from '../Layout/Modal/FileUploader';
import { configuration } from '../../config/config';

function parseTaskText(task) {
  if (task.workerUser === null) {
    return [parseTaskType(task.type) + ':', ''];
  } else {
    return [parseTaskType(task.type) + ':', task.workerUser.nickname];
  }
}

function Segment({data}) {
  const dispatch = useDispatch();
  
  const myUserId = useSelector((state) => state.userAuth.userId);
  const myOpenedSegmentIds = useSelector((state) => state.layout.openedSegmentIds);
  const isOpenUploaderWindow = useSelector((state) => state.file.openUploaderWindow);

  const [assignTaskMutation] = useAssignTaskMutation();
  const [withdrawTaskMutation] = useWithdrawTaskMutation();
  const [assignFileToTaskMutation] = useAssignFileToTaskMutation();
  const [deleteSegmentMutation] = useDeleteSegmentMutation();
  
  function assignTask(userId, taskId) {
    assignTaskMutation({
      userId: userId,
      taskId: taskId,
    })
    .then((response) => {
      // Handle Different Messages
    })
  }

  function withdrawTask(taskId) {
    withdrawTaskMutation(taskId)
    .then((response) => {
      // Handle Different Messages
    })
  }

  function handleUpload(myTaskId) {
    dispatch(updateCurrentIdToUpload(myTaskId));
    dispatch(updateCurrentUploadType(3));
    dispatch(openUploaderWindow());
  }

  function handleDeleteTask(myTaskId) {
    assignFileToTaskMutation({
      taskId: myTaskId,
      fileRecordId: 0,
    })
    .then((response) => {
      // TODO: Deal with other return messages
    })
  }

  function handleDeleteSegment(mySegmentId) {
    deleteSegmentMutation(mySegmentId)
    .then((response) => {
      // TODO: Deal with other return messages
    })
  }

  const summary = data.isGlobal ? '概览' : data.summary;
  const scope = data.isGlobal ? '' : data.scope;
  const tasks = data.taskInfos;
  
  function parseTaskButton(task) {
    if (task.status === 'NOT_ASSIGNED') {
      return (<button className='general-button-green' onClick={() => assignTask(myUserId, task.taskId)}>承接</button>);
    } else if (task.status === 'IN_PROGRESS' && task.workerUser.userId !== myUserId) {
      return;
    } else if (task.status === 'IN_PROGRESS' && task.workerUser.userId === myUserId) {
      return (
        <div>
          <button className='general-button-grey' onClick={() => handleUpload(task.taskId)}>上传</button>
          <button className='general-button-red' onClick={() => withdrawTask(task.taskId)}>放弃</button>
        </div>
      );
    } else if (task.status === 'COMPLETED' && task.workerUser.userId !== myUserId) {
      let downloadUrl = `http://${configuration.HOSTNAME}:8080/api/files/` + task.fileId;
      return (
        <div>
          <a
            href={downloadUrl}
          >
            <button className='general-button-grey'>下载</button>
          </a>
        </div>
      );
    } else if (task.status === 'COMPLETED' && task.workerUser.userId === myUserId) {
      let downloadUrl = `http://${configuration.HOSTNAME}:8080/api/files/` + task.fileId;
      return (
        <div>
          <button className='general-button-grey' onClick={() => handleDeleteTask(task.taskId)}>删除</button>
          <a
            href={downloadUrl}
          >
            <button className='general-button-grey'>下载</button>
          </a>
          
        </div>
      );
    }
  }

  function handleExpanded() {
    dispatch(openSegment(data.segmentId));
  }

  function handleMinimized() {
    dispatch(closeSegment(data.segmentId));
  }

  return (
    <div className='segment-container'>
      
      { isOpenUploaderWindow === 1 &&
        <FileUploader />
      }
      
      <div className='segment-title-container'>
        {
          !myOpenedSegmentIds.includes(data.segmentId) &&
          <button className='general-icon-button' onClick={() => handleExpanded()}><Icon as={FaAngleDown} size="2.5em" style={{ marginRight: '10px' }}/></button>
        }

        {
          myOpenedSegmentIds.includes(data.segmentId) &&
          <button className='general-icon-button' onClick={() => handleMinimized()}><Icon as={FaAngleUp} size="2.5em" style={{ marginRight: '10px' }}/></button>
        }
        <label className='general-font-medium-small-bold'>{summary}</label>
        
        { !data.isGlobal && 
          <button className='general-icon-button' onClick={() => handleDeleteSegment(data.segmentId)}><Icon as={FaTrash} size="1.75em" style={{ color : '#a0a0a0' }}/></button>
        } 
        
      </div>

      <div className='segment-status-icon-container'>
        {tasks.map((task) =>
          <div key={task.taskId}>
            <TaskStatusIcon type={task.type} status={task.status}/>
          </div>
        )}
      </div>

      { myOpenedSegmentIds.includes(data.segmentId) &&
      <div>
        { !data.isGlobal && 
          <div className='segment-item-container'>
            <label className='general-font-medium-small-bold'>起讫: </label>
            <label className='general-font-medium-small'>{parseScope(scope)}</label>
          </div>
        }
        <div>
          {tasks.map((task) =>
            <div key={task.taskId} className='segment-item-container'>
              <label className='general-font-medium-small-bold'>
                {parseTaskText(task)[0]}
              </label>
              <label className='general-font-medium-small'>
                {parseTaskText(task)[1]}
              </label>
              {parseTaskButton(task)}
            </div>
          )}
        </div>
      </div>
      }  
    </div>
  );
}

export default Segment;