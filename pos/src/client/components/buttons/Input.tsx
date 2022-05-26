import React, { FC, useState } from 'react';
import css from './Input.module.css';

interface IinputProps {
    labelValue: string;
    memoValue: string;
    recipientValue: string;
    changeLabel: (arg: string) => void;
    changeMemo: (arg: string) => void;
    changeRecipient: (arg: string) => void;
}
export const Input: FC<IinputProps> = (props) => {
    return (
        <>
            <label htmlFor="recipient" className={css.label}>
                Enter Recipient
            </label>
            <input
                id="recipient"
                onChange={(e) => props.changeRecipient(e.target.value)}
                required
                type="text"
                className={css.root}
            />
            <label htmlFor="label" className={css.label}>
                Enter Label
            </label>
            <input
                id="label"
                onChange={(e) => props.changeLabel(e.target.value)}
                required
                type="text"
                className={css.root}
            />
            <label htmlFor="memo" className={css.label}>
                Enter Memo
            </label>
            <input
                id="memo"
                onChange={(e) => props.changeMemo(e.target.value)}
                required
                type="text"
                className={css.root}
            />
        </>
    );
};
