import React, { FC, useState } from 'react';
import css from './Input.module.css';

interface IinputProps {
    labelValue: string,
    recipientValue: string,
    changeLabel: (arg: string) => void
    changeRecipient: (arg: string) => void
}
export const Input: FC<IinputProps>= (props) => {
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
