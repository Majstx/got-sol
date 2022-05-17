import React, { FC, useState } from 'react';
import css from './Input.module.css';

export const Input: FC = (props) => {
    return (
        <>
            <input
                id="recipient"
                onChange={(e) => props.changeRecipient(e.target.value)}
                required
                type="text"
                className={css.root}
                placeholder="Enter Recipient"
            />
            <input
                id="label"
                onChange={(e) => props.changeLabel(e.target.value)}
                required
                type="text"
                className={css.root}
                placeholder="Enter Label "
            />
            
        </>
    );
};
